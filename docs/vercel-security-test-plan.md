# Plan rapido de pruebas en Vercel

Cuando publiques el visor en Vercel, reemplaza `URL` por tu dominio real.

## 1. Cabeceras HTTP

```bash
curl -I https://URL
```

Verificar que aparezcan:

- `content-security-policy`
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `referrer-policy`
- `permissions-policy`
- `strict-transport-security`
- `cache-control`

Tambien puedes usar:

https://securityheaders.com/

Resultado esperado: idealmente A o A+. Si aparece una observacion, revisar si corresponde a una limitacion de Vercel o una cabecera faltante.

## 2. OWASP ZAP baseline

```bash
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://URL -r zap-report.html
```

Resultado esperado:

- Sin alertas High.
- Sin alertas Medium sin justificar.
- Alertas Informational documentadas.

## 3. WAFW00F

```bash
wafw00f https://URL
```

En Vercel puede no detectar un WAF clasico. Eso no significa necesariamente que el sitio este roto, pero para publicacion institucional si conviene que OGTI confirme WAF o proteccion perimetral propia.

## 4. TLS

```bash
nmap --script ssl-enum-ciphers -p 443 URL_SIN_HTTPS
```

Resultado esperado:

- TLS 1.2 o TLS 1.3.
- Sin TLS 1.0/TLS 1.1.
- Sin cifrados debiles.

## 5. Carga y concurrencia

Instalar k6 y ejecutar:

```bash
k6 run -e TARGET_URL=https://URL/ tests/load/k6-baseline.js
```

Escenarios incluidos:

- 50 usuarios concurrentes por 30 segundos.
- 80 usuarios concurrentes por 30 segundos.
- 90 usuarios concurrentes por 30 segundos.

Documentar:

- Porcentaje de errores.
- Tiempo promedio.
- p(95).
- Si aparece degradacion parcial.

## 6. Checklist antes de enviar a OGTI

- Vercel despliega con `vercel.json`.
- SecurityHeaders no reporta cabeceras criticas faltantes.
- OWASP ZAP sin alertas altas o medias pendientes.
- k6 con 0% de errores en 50 y 80 usuarios.
- PDFs abren desde `/pdf/` y no desde cuentas personales.
- No subir `archive/` al repositorio.
