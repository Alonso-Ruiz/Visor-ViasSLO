# Guia para actualizar datos desde QGIS/qgis2web

## Archivos que usa el visor

El visor actual carga estos datos desde `layers/`:

- `layers/limite_distrital_0.js`
- `layers/red_vial_1.js`
- `layers/Secciones_Viales_2.js`

Los archivos `.geojson` dentro de `data/` son copias limpias para un despliegue futuro, pero no son la fuente activa del visor en este momento.

## Donde estan los links de PDF

Los links salen del campo `LINK` del layer. Actualmente aparecen en:

- `layers/Secciones_Viales_2.js`
- `layers/red_vial_1.js`

El visor tambien revisa campos alternativos como `link` y `SECCIÓN_`.

## PDFs locales

Para dejar de depender de OneDrive/Google Drive:

1. Guardar los PDFs dentro de `pdf/`.
2. En QGIS, llenar el campo `LINK` con la ruta del archivo, por ejemplo `pdf/VLP-CA-19A` o `pdf/VLP-CA-19A.pdf`.
3. Si la ruta empieza con `pdf/` y no tiene extension, el visor completara `.pdf` automaticamente.

Tambien se permite escribir solo `VLP-CA-19A.pdf`; en ese caso el visor lo abrira dentro de `pdf/`.

## Compatibilidad con links antiguos

El visor mantiene compatibilidad con:

- URLs completas `https://...`
- IDs antiguos de Google Drive
- rutas locales a PDF

Esto permite migrar por partes sin romper los registros antiguos.

## Cuando llegue un nuevo export

1. Reemplazar solo los archivos equivalentes dentro de `layers/`.
2. Mantener los nombres esperados por el visor o ajustar las referencias en `index.html` y `js/utils.js`.
3. Validar que los campos `NOMBRE_FIN`, `CLASIFIC`, `CATEGORÍA`, `CÓDIGO`, `TRAMO`, `ANCHO` y `LINK` sigan existiendo o tengan equivalentes.
4. Copiar los PDFs nuevos a `pdf/`.
5. Probar búsqueda, click en vía y apertura del PDF.
