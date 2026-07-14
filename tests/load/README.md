# Pruebas de carga

Estas pruebas simulan usuarios descargando el HTML, CSS, JS, capas y assets principales del visor publicado.

## Requisito

Instalar k6:

- Windows: `winget install k6.k6`
- macOS: `brew install k6`
- Linux: ver instalacion oficial de k6

## Ejecutar contra Vercel

```bash
k6 run -e TARGET_URL=https://TU_URL_DE_VERCEL.vercel.app/ tests/load/k6-baseline.js
```

## Como leer resultados

- `http_req_failed`: debe quedar idealmente en `0.00%`.
- `http_req_duration`: revisar promedio, p(90) y p(95).
- Si falla en 90 usuarios pero no en 50 u 80, se documenta como degradacion parcial, igual que en el informe anterior.

## Recomendacion

Ejecutar estas pruebas solo contra despliegues propios o autorizados. No usar pruebas agresivas tipo SYN flood contra Vercel o infraestructura institucional sin autorizacion formal.
