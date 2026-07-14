# Guia de validacion de seguridad y rendimiento

Este documento adapta al visor vial las evaluaciones usadas en el informe tecnico del sistema anterior. El visor es una aplicacion estatica, por lo que algunas medidas se aplican en codigo y otras deben configurarse en el servidor institucional.

## Alcance

- URL objetivo: definir cuando OGTI publique el visor, por ejemplo `https://visor-vias.msb.gob.pe/`.
- Tipo de sistema: visor web estatico con OpenLayers, datos GeoJSON/JS, PDFs locales y capa satelital externa de Google.
- Datos personales: el visor no debe recolectar ni procesar informacion personal.

## Pruebas equivalentes al informe

1. OWASP ZAP Baseline Scan
   - Objetivo: detectar cabeceras faltantes, CSP debil, recursos mixtos, exposicion de informacion y riesgos XSS.
   - Comando sugerido:
     ```bash
     docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://URL_DEL_VISOR -r zap-report.html
     ```
   - Resultado esperado: sin alertas altas o medias. Las alertas informativas deben documentarse.

2. Validacion de cabeceras HTTP
   - Objetivo: confirmar hardening web.
   - Comando sugerido:
     ```bash
     curl -I https://URL_DEL_VISOR
     ```
   - Cabeceras esperadas:
     - `Content-Security-Policy`
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy`
     - `Cache-Control`
     - `Strict-Transport-Security`

3. WAFW00F
   - Objetivo: validar si el despliegue institucional esta protegido por WAF.
   - Comando sugerido:
     ```bash
     wafw00f https://URL_DEL_VISOR
     ```
   - Resultado esperado: deteccion de WAF institucional o confirmacion de proteccion perimetral equivalente.

4. Nmap TLS
   - Objetivo: validar TLS 1.2/1.3 y descartar cifrados debiles.
   - Comando sugerido:
     ```bash
     nmap --script ssl-enum-ciphers -p 443 URL_DEL_VISOR_SIN_HTTPS
     ```
   - Resultado esperado: TLS 1.2/TLS 1.3, sin SSLv2, SSLv3, TLS 1.0 ni TLS 1.1.

5. JMeter o k6
   - Objetivo: medir concurrencia y tiempos de respuesta.
   - Escenarios equivalentes al informe:
     - 50 usuarios concurrentes, ramp-up 1 segundo, 1 iteracion.
     - 80 usuarios concurrentes, ramp-up 1 segundo, 1 iteracion.
     - 90 usuarios concurrentes, ramp-up 1 segundo, 1 iteracion.
   - Resultado esperado: 0% de errores hasta 80 usuarios y degradacion controlada en cargas mayores.

6. Prueba de resiliencia de trafico
   - Objetivo: verificar comportamiento bajo trafico anomalo controlado.
   - Debe ejecutarse solo con autorizacion de OGTI y en ventana aprobada.
   - Herramienta equivalente: `hping3` o prueba de carga institucional.

## Mejoras ya aplicadas en el proyecto

- OpenLayers se sirve localmente desde `vendor/openlayers`, evitando dependencia CDN.
- Se agrego una CSP inicial en `index.html`.
- Se retiraron manejadores `onclick` inline para permitir `script-src 'self'`.
- Se reemplazaron usos innecesarios de `innerHTML` por creacion segura de nodos o `textContent`.
- Los links PDF se normalizan y se abren con `rel="noopener noreferrer"`.
- El directorio `archive/` queda ignorado por Git para no publicar archivos no usados.

## Pendientes de servidor institucional

Estas medidas no se pueden garantizar solo desde el codigo estatico:

- WAF institucional.
- Cabecera real `X-Frame-Options` o CSP `frame-ancestors`.
- `X-Content-Type-Options`.
- `Strict-Transport-Security`.
- Politicas de cache por tipo de archivo.
- Monitoreo de disponibilidad, trafico y eventos.
- Backups y procedimiento de recuperacion.

Usar `docs/server-security-headers.nginx.conf` como referencia para Nginx, `docs/server-security-headers.apache.htaccess` como referencia para Apache, o pedir a OGTI su equivalente en IIS.
