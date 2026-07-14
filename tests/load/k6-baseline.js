import http from 'k6/http';
import { check, sleep } from 'k6';

// Limpiamos la URL base para asegurar que no termine en '/'
const rawTargetUrl = __ENV.TARGET_URL || 'https://visor-vias-slo.vercel.app/';
const targetUrl = rawTargetUrl.endsWith('/') ? rawTargetUrl.slice(0, -1) : rawTargetUrl;

export const options = {
  scenarios: {
    concurrent_50: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
      startTime: '0s'
    },
    concurrent_80: {
      executor: 'constant-vus',
      vus: 80,
      duration: '30s',
      startTime: '40s'
    },
    concurrent_90: {
      executor: 'constant-vus',
      vus: 90,
      duration: '30s',
      startTime: '80s'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<5000']
  }
};

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
  '/vendor/openlayers/ol.js',
  '/vendor/openlayers/ol.css',
  '/layers/red_vial_1.js',
  '/layers/Secciones_Viales_2.js',
  '/layers/limite_distrital_0.js',
  '/Escudo_de_San_Borja.png'
];

export default function () {
  for (const path of staticAssets) {
    // Aseguramos que el path empiece con '/'
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${targetUrl}${cleanPath}`;

    const res = http.get(fullUrl, {
      tags: { asset: path }
    });

    check(res, {
      'status 200': (r) => r.status === 200,
      'response below 5s': (r) => r.timings.duration < 5000
    });
  }

  sleep(1);
}