# Visor de Vias - San Borja

Visor estatico basado en OpenLayers para consultar la clasificacion vial y las secciones normativas del distrito.

## Estructura actual

- `index.html`: estructura HTML, paneles, modal inicial y carga de dependencias.
- `css/main.css`: estilos del mapa, paneles, popup y responsive.
- `js/utils.js`: utilidades, normalizacion de texto, seguridad basica y helpers de propiedades.
- `js/layers.js`: lectura de datos, estilos y creacion de capas vectoriales.
- `js/map.js`: inicializacion del mapa, controles, interacciones y visibilidad de capas.
- `js/popup.js`: popup, links de PDF y centrado inteligente.
- `js/search.js`: indice de vias y buscador.
- `js/app.js`: arranque final.
- `layers/`: datos exportados por QGIS/qgis2web como variables JavaScript. El visor carga estos archivos actualmente.
- `data/`: datos equivalentes en `.geojson`, recomendados para hosting estatico.
- `vendor/openlayers/`: OpenLayers local, usado para no depender de CDN en hosting municipal.
- `pdf/`: PDFs locales de secciones viales.
- `archive/unused-export/`: recursos del export original no usados por la pagina actual.
- `Escudo_de_San_Borja.png`: imagen usada en la portada.

## Archivos usados directamente

- `css/main.css`
- `js/utils.js`
- `js/layers.js`
- `js/map.js`
- `js/popup.js`
- `js/search.js`
- `js/app.js`
- `Escudo_de_San_Borja.png`
- `layers/limite_distrital_0.js`
- `layers/red_vial_1.js`
- `layers/Secciones_Viales_2.js`
- `vendor/openlayers/ol.css`
- `vendor/openlayers/ol.js`

## Pendientes recomendados

1. Cuando llegue un nuevo export de QGIS/qgis2web, reemplazar los archivos equivalentes dentro de `layers/`.
2. El archivo que contiene los links de PDF es el layer con propiedad `LINK`, actualmente `layers/Secciones_Viales_2.js` y tambien varios registros de `layers/red_vial_1.js`.
3. Para PDFs locales, guardar los archivos en `pdf/` y poner en el campo `LINK` valores como `VLP-CA-19A.pdf` o `pdf/VLP-CA-19A.pdf`.
4. Si se publica con carga moderna de datos, usar `data/*.geojson` mediante `fetch`; por ahora se conservan `layers/*.js` para abrir el visor directamente.
5. Optimizar datos geograficos si crecen: compresion gzip/brotli, simplificacion de geometria o carga por demanda.

## Configuracion recomendada de cabeceras de seguridad

El archivo `vercel.json` contiene las cabeceras usadas para las pruebas en Vercel, pero no sera leido por el servidor institucional. Para el despliegue en infraestructura del Gobierno, OGTI debe configurar las cabeceras en el servidor web o proxy reverso.

Referencias listas para OGTI:

- Nginx: `docs/server-security-headers.nginx.conf`
- Apache: `docs/server-security-headers.apache.htaccess`
- Nota de entrega y WAF: `docs/institutional-security-handoff.md`

El WAF no requiere cambios en el codigo del visor. Debe aplicarse como capa externa delante del servidor, mediante el WAF o proxy de seguridad institucional definido por OGTI.

## Verificacion rapida

Abrir `index.html` en el navegador. Si se sirve desde un hosting estatico, mantener la misma estructura de carpetas.
