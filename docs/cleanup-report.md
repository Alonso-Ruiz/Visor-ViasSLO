# Reporte de limpieza

Estado despues de separar `index.html`, `css/main.css` y los modulos de `js/`.

## Referencias activas desde `index.html`

- `css/main.css`
- `Escudo_de_San_Borja.png`
- `layers/limite_distrital_0.js`
- `layers/red_vial_1.js`
- `layers/Secciones_Viales_2.js`
- `js/utils.js`
- `js/layers.js`
- `js/map.js`
- `js/popup.js`
- `js/search.js`
- `js/app.js`
- `vendor/openlayers/ol.css`
- `vendor/openlayers/ol.js`

## Recursos archivados

Estos archivos no aparecen referenciados por el `index.html` actual y se movieron a `archive/unused-export/`:

- `resources/`
- `styles/`
- `webfonts/`
- `layers/jerarqua_vial_1.js`
- `layers/layers.js`

Nota: `resources/ol.js` y `resources/ol.css` se copiaron a `vendor/openlayers/` antes de archivar `resources/`, porque OpenLayers si es necesario para el mapa.

## Datos geograficos

Se crearon copias limpias en formato `.geojson`:

- `data/limite_distrital.geojson`
- `data/red_vial.geojson`
- `data/secciones_viales.geojson`

El visor conserva los scripts de `layers/` para funcionar al abrir `index.html` directamente. En un hosting estatico, se puede migrar a `fetch("data/*.geojson")` y retirar las cargas de `layers/*.js`.

## Recomendacion

Probar el visor despues del archivado. El visor ya usa OpenLayers local desde `vendor/openlayers/`. El resto de `resources/`, `styles/` y `webfonts/` se conserva en `archive/unused-export/` solo como respaldo.
