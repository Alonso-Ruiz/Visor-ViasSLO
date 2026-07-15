const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');

const layerFiles = [
  'layers/red_vial_1.js',
  'layers/Secciones_Viales_3_0.js',
  'layers/PlantasdeAlamedasypasajes_1.js',
  'layers/Sectores_2.js',
  'layers/subsectores_1.js',
  'layers/limite_distrital_0.js',
];

function readText(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function getExpectedPdfName(value) {
  if (!value || typeof value !== 'string') return null;
  let cleaned = value.trim().replace(/\\/g, '/');
  if (!cleaned || /^https?:\/\//i.test(cleaned)) return null;
  let leaf = cleaned.split('/').pop();
  if (!leaf) return null;
  if (!/\.pdf$/i.test(leaf)) leaf += '.pdf';
  return leaf;
}

function readFeatureCollection(relativePath) {
  const code = readText(relativePath);
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context, { filename: relativePath });
  const entry = Object.entries(context).find(([, value]) => value && value.type === 'FeatureCollection');
  if (!entry) throw new Error(`No FeatureCollection found in ${relativePath}`);
  return { varName: entry[0], data: entry[1] };
}

function collectExpectedPdfs() {
  const expected = new Map();
  for (const layerFile of layerFiles) {
    if (!fileExists(layerFile)) continue;
    const { data } = readFeatureCollection(layerFile);
    for (const feature of data.features || []) {
      const props = feature.properties || {};
      for (const field of ['LINKVERCEL', 'LINK']) {
        const fileName = getExpectedPdfName(props[field]);
        if (!fileName) continue;
        if (!expected.has(fileName.toLowerCase())) {
          expected.set(fileName.toLowerCase(), { fileName, layerFile });
        }
      }
    }
  }
  expected.set('vls-al-p11_alameda_jose_carlos_mariategui.pdf', {
    fileName: 'VLS-AL-P11_Alameda_Jose_Carlos_Mariategui.pdf',
    layerFile: 'manual: Torres de San Borja P11',
  });
  return expected;
}

function readManifest() {
  const code = readText('js/pdf-manifest.js');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: 'js/pdf-manifest.js' });
  return Array.isArray(context.window.PDF_MANIFEST) ? context.window.PDF_MANIFEST : [];
}

function listPdfs() {
  const pdfDir = path.join(projectRoot, 'pdf');
  return fs.readdirSync(pdfDir).filter((name) => /\.pdf$/i.test(name));
}

function getScriptSources() {
  const html = readText('index.html');
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((match) => match[1]);
}

function main() {
  const issues = [];
  const layerSummaries = [];

  for (const layerFile of layerFiles) {
    if (!fileExists(layerFile)) {
      issues.push(`Missing layer file: ${layerFile}`);
      continue;
    }
    const { varName, data } = readFeatureCollection(layerFile);
    layerSummaries.push(`${layerFile}: ${data.features.length} features (${varName})`);
  }

  for (const src of getScriptSources()) {
    if (!fileExists(src)) issues.push(`index.html references missing script: ${src}`);
  }

  const expected = collectExpectedPdfs();
  const pdfs = listPdfs();
  const manifest = readManifest();
  const pdfSet = new Set(pdfs.map((name) => name.toLowerCase()));
  const manifestSet = new Set(manifest.map((name) => String(name).toLowerCase()));
  const expectedSet = new Set(expected.keys());

  const missingPdfs = [...expected.values()].filter((item) => !pdfSet.has(item.fileName.toLowerCase()));
  const extraPdfs = pdfs.filter((name) => !expectedSet.has(name.toLowerCase()));
  const missingManifest = pdfs.filter((name) => !manifestSet.has(name.toLowerCase()));
  const extraManifest = manifest.filter((name) => !pdfSet.has(String(name).toLowerCase()));

  if (missingPdfs.length) issues.push(`Missing PDFs: ${missingPdfs.length}`);
  if (extraPdfs.length) issues.push(`PDFs not referenced: ${extraPdfs.length}`);
  if (missingManifest.length) issues.push(`PDFs missing from manifest: ${missingManifest.length}`);
  if (extraManifest.length) issues.push(`Manifest entries without PDF: ${extraManifest.length}`);

  console.log('Project audit summary');
  console.log(`Project: ${projectRoot}`);
  console.log('');
  console.log('Layers:');
  for (const summary of layerSummaries) console.log(`- ${summary}`);
  console.log('');
  console.log(`Expected PDFs: ${expected.size}`);
  console.log(`PDF files: ${pdfs.length}`);
  console.log(`Manifest entries: ${manifest.length}`);
  console.log(`Missing PDFs: ${missingPdfs.length}`);
  console.log(`PDFs not referenced: ${extraPdfs.length}`);
  console.log(`PDFs missing from manifest: ${missingManifest.length}`);
  console.log(`Manifest entries without PDF: ${extraManifest.length}`);

  if (missingPdfs.length) {
    console.log('');
    console.log('Missing PDF samples:');
    for (const item of missingPdfs.slice(0, 20)) console.log(`- ${item.fileName} (${item.layerFile})`);
  }

  if (extraPdfs.length) {
    console.log('');
    console.log('Unreferenced PDF samples:');
    for (const item of extraPdfs.slice(0, 20)) console.log(`- ${item}`);
  }

  console.log('');
  if (issues.length) {
    console.log('Audit result: FAILED');
    process.exitCode = 1;
  } else {
    console.log('Audit result: OK');
  }
}

main();
