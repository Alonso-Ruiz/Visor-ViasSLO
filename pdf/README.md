# PDFs de secciones viales

Coloca aqui los PDFs que debe abrir el visor.

## Como referenciarlos desde QGIS

En la tabla de atributos del layer, el campo `LINK` puede tener cualquiera de estas formas:

- `pdf/VLP-CA-19A.pdf`
- `pdf/VLP-CA-19A`
- `VLP-CA-19A.pdf`
- una URL completa `https://...`

Si se coloca `pdf/VLP-CA-19A` sin extension, el visor completara `.pdf` automaticamente.
Si solo se coloca `VLP-CA-19A.pdf`, el visor lo abrira como archivo local dentro de `pdf/`.

## Recomendacion

Usar nombres estables basados en el codigo de la via o seccion, sin espacios ni tildes:

- `VLP-CA-19A.pdf`
- `VLS-PA-153.pdf`
- `VIA-METROPOLITANA-001.pdf`

Cuando actualicen datos desde QGIS/qgis2web, revisar que el campo `LINK` apunte al PDF local correspondiente.
