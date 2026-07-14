# Configuracion recomendada de cabeceras de seguridad

El archivo `vercel.json` solo aplica cuando el visor se publica en Vercel. Si el visor se despliega en infraestructura del Gobierno, OGTI debe configurar las cabeceras HTTP en el servidor web o proxy reverso institucional.

## Cabeceras equivalentes a Vercel

Estas son las cabeceras actualmente configuradas para el visor:

- `Content-Security-Policy`: limita scripts, estilos, imagenes y conexiones al propio visor y a `https://mt1.google.com`, usado para la capa satelital.
- `X-Frame-Options: DENY`: evita que el visor sea embebido en iframes externos.
- `X-Content-Type-Options: nosniff`: evita interpretaciones MIME inseguras.
- `Referrer-Policy: strict-origin-when-cross-origin`: reduce informacion enviada en el referer.
- `Permissions-Policy`: bloquea geolocalizacion, microfono, camara, pagos y USB; permite fullscreen solo al propio visor.
- `Strict-Transport-Security`: exige HTTPS en navegadores compatibles.
- `Cache-Control`: no cachear `index.html`; cachear recursos estaticos versionables por 7 dias.

## Nginx

Usar como referencia:

```text
docs/server-security-headers.nginx.conf
```

OGTI debe adaptar `server_name`, `root`, certificados TLS y rutas segun su ambiente.

## Apache

Usar como referencia:

```text
docs/server-security-headers.apache.htaccess
```

Si Apache no permite `.htaccess`, OGTI puede mover esas reglas al `VirtualHost` correspondiente.

## WAF institucional

El WAF no se implementa en el codigo HTML, CSS o JavaScript del visor. En Vercel, esa capa depende de la red de Vercel; en el dominio del Gobierno debe quedar a cargo del WAF perimetral institucional o del proxy de seguridad que defina OGTI.

Accion esperada para OGTI:

- Publicar el visor detras del WAF institucional.
- Confirmar proteccion contra trafico anomalo, patrones OWASP comunes y denegacion de servicio.
- Validar el despliegue con `wafw00f`, OWASP ZAP Baseline y las pruebas TLS autorizadas.
