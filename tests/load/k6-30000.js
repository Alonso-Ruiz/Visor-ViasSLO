import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const rawTargetUrl = __ENV.TARGET_URL || 'https://visor-vias-slo.vercel.app/';
const targetUrl = rawTargetUrl.endsWith('/') ? rawTargetUrl.slice(0, -1) : rawTargetUrl;

const totalRequests = Number(__ENV.TOTAL_REQUESTS || 30000);
const vus = Number(__ENV.VUS || 120);
const testDuration = __ENV.TEST_DURATION || '10m';
const maxDuration = __ENV.MAX_DURATION || '20m';
const mode = (__ENV.MODE || 'sustained').toLowerCase(); // 'sustained', 'burst', 'max_stress', 'ramp_step'
const debugErrors = String(__ENV.DEBUG_ERRORS || '').toLowerCase() === 'true';

const statusErrors = new Counter('status_errors');

const staticAssets = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/map.js',
  '/js/layers.js',
  '/js/search.js',
  '/js/popup.js',
  '/js/utils.js',
  '/js/pdf-manifest.js',
  '/vendor/openlayers/ol.js',
  '/vendor/openlayers/ol.css',
  '/layers/red_vial_1.js',
  '/layers/Secciones_Viales_3_0.js',
  '/layers/PlantasdeAlamedasypasajes_1.js',
  '/layers/Sectores_2.js',
  '/layers/subsectores_1.js',
  '/layers/limite_distrital_0.js',
  '/styles/PlantasdeAlamedasypasajes_1_style.js',
  '/styles/Sectores_2_style.js',
  '/styles/subsectores_1_style.js',
  '/Escudo_de_San_Borja.png',
];

const iterations = Math.ceil(totalRequests / staticAssets.length);
const requested = iterations * staticAssets.length;

function durationToMinutes(value) {
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)(s|m|h)$/i);
  if (!match) return 10;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 's') return amount / 60;
  if (unit === 'h') return amount * 60;
  return amount;
}

const durationMinutes = Math.max(durationToMinutes(testDuration), 1 / 60);
const sustainedRatePerMinute = Math.max(1, Math.ceil(iterations / durationMinutes));
const sustainedIterations = Math.ceil(sustainedRatePerMinute * durationMinutes);
const sustainedRequests = sustainedIterations * staticAssets.length;

let scenario;

if (mode === 'burst') {
  scenario = {
    executor: 'shared-iterations',
    vus,
    iterations,
    maxDuration,
  };
} else if (mode === 'max_stress') {
  scenario = {
    executor: 'constant-vus',
    vus,
    duration: testDuration,
  };
} else if (mode === 'ramp_step') {
  // NUEVO: Escalones de 60 -> 70 -> 80 -> 90 -> 100 VUs
  scenario = {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 60 },
      { duration: '2m',  target: 60 },
      { duration: '30s', target: 70 },
      { duration: '2m',  target: 70 },
      { duration: '30s', target: 80 },
      { duration: '2m',  target: 80 },
      { duration: '30s', target: 90 },
      { duration: '2m',  target: 90 },
      { duration: '30s', target: 100 },
      { duration: '2m',  target: 100 },
      { duration: '1m',  target: 0 },
    ],
    gracefulRampDown: '30s',
  };
} else {
  scenario = {
    executor: 'constant-arrival-rate',
    rate: sustainedRatePerMinute,
    timeUnit: '1m',
    duration: testDuration,
    preAllocatedVUs: vus,
    maxVUs: Math.max(vus, Math.ceil(vus * 1.5)),
  };
}

export const options = {
  scenarios: {
    prueba_k6: scenario,
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<5000'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  for (const assetPath of staticAssets) {
    const res = http.get(`${targetUrl}${assetPath}`, {
      tags: { asset: assetPath },
    });

    check(res, {
      'status 200': (r) => r.status === 200,
      'response below 5s': (r) => r.timings.duration < 5000,
    });

    if (res.status !== 200) {
      statusErrors.add(1, {
        asset: assetPath,
        status: String(res.status || 'network_error'),
      });

      if (debugErrors && __ITER < 1) {
        console.log(`ERROR asset=${assetPath} status=${res.status} url=${targetUrl}${assetPath}`);
      }
    }
  }

  sleep(0.2); // Pausa recomendada entre iteraciones para simular comportamiento humano
}

export function handleSummary(data) {
  return {
    stdout:
      '\n========================================\n' +
      '         RESUMEN DE PRUEBA K6           \n' +
      '========================================\n' +
      `URL objetivo:          ${targetUrl}\n` +
      `Modo de prueba:        ${mode.toUpperCase()}\n` +
      `Assets por iteración:  ${staticAssets.length}\n` +
      '----------------------------------------\n' +
      `http_req_failed:       ${data.metrics.http_req_failed?.values?.rate ?? 'n/a'}\n` +
      `http_req_duration p95: ${data.metrics.http_req_duration?.values?.['p(95)'] ?? 'n/a'} ms\n` +
      `checks rate:           ${data.metrics.checks?.values?.rate ?? 'n/a'}\n` +
      `status_errors:         ${data.metrics.status_errors?.values?.count ?? 0}\n` +
      '========================================\n\n',
  };
}