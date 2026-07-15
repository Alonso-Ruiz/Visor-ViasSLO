        // =========================================================
        // 2. MAPA, SATÉLITE Y ESTILOS
        // =========================================================
        var formatJSON = new ol.format.GeoJSON();
        function leerFeatures(jsonData) {
            if(!jsonData) return [];
            return formatJSON.readFeatures(jsonData, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        }

        var satSource = new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', maxZoom: 22, attributions: '© Google' });
        var googleSat = new ol.layer.Tile({ source: satSource, zIndex: 0 });

        function crearEstilo(color, width, dash, includeText, feature) {
            var stroke = new ol.style.Stroke({ 
                color: color, 
                width: width, 
                lineDash: dash,
                lineCap: 'round',
                lineJoin: 'round'
            });
            var style = new ol.style.Style({ stroke: stroke });
            var labelText = feature.get('_fixedName');

            if (includeText && labelText && labelText !== '-') {
                style.setText(new ol.style.Text({
                    text: labelText, placement: 'line', font: 'bold 11.5px "Segoe UI", Arial, sans-serif',
                    fill: new ol.style.Fill({ color: '#ffffff' }), stroke: new ol.style.Stroke({ color: '#333333', width: 2.5 }),
                    overflow: false, maxAngle: Math.PI / 8, offsetY: -5
                }));
            }
            return style;
        }

        var style_limite = new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#1a1a1a', width: 4.5, lineDash: [12, 10], lineCap: 'round', lineJoin: 'round' }) });
        function styleMetroArterialFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#00a651', 4, null, (z >= 14), feature); }
        function styleMetroColectoraFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#ffd400', 4, null, (z >= 14), feature); }
        function styleMetroExpresaFn(feature, resolution) {
            var z = map.getView().getZoomForResolution(resolution);
            var styles = [
                new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#111111', width: 6, lineCap: 'round', lineJoin: 'round' }) }),
                new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#e60000', width: 3.5, lineCap: 'round', lineJoin: 'round' }) })
            ];
            var labelText = feature.get('_fixedName');
            if (z >= 14 && labelText && labelText !== '-') {
                styles.push(new ol.style.Style({
                    text: new ol.style.Text({
                        text: labelText,
                        placement: 'line',
                        font: 'bold 11.5px "Segoe UI", Arial, sans-serif',
                        fill: new ol.style.Fill({ color: '#ffffff' }),
                        stroke: new ol.style.Stroke({ color: '#111111', width: 2.5 }),
                        overflow: false,
                        maxAngle: Math.PI / 8,
                        offsetY: -5
                    })
                }));
            }
            return styles;
        }
        function stylePrefFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#8e0500', 4, null, (z >= 15), feature); }
        
        function styleSecVehFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#fb8c00', 2.5, null, (z >= 15), feature); }
        function styleSecResFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#f57c00', 2, null, (z >= 15), feature); }
        function styleSecPasFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#ef6c00', 1.8, null, (z >= 15), feature); }
        function styleSecAlaFn(feature, resolution) { var z = map.getView().getZoomForResolution(resolution); return crearEstilo('#e65100', 1.8, null, (z >= 15), feature); }
        
        function styleSeccionesFn(feature, resolution) {
            var z = map.getView().getZoomForResolution(resolution);
            if (z < 16) return null; 
            var p = feature.getProperties();
            var codigo = getProp(p, 'CODIGO', 'C\u00d3DIGO') || "-";
            return new ol.style.Style({
                stroke: new ol.style.Stroke({ color: '#00975D', width: 4.5, lineDash: [8, 8], lineCap: 'round', lineJoin: 'round' }),
                text: new ol.style.Text({
                    text: codigo, placement: 'line', font: 'bold 12px "Segoe UI", Arial, sans-serif',
                    fill: new ol.style.Fill({ color: '#ffffff' }), stroke: new ol.style.Stroke({ color: '#00975D', width: 3.5 }), 
                    overflow: false, maxAngle: Math.PI / 8, offsetY: -10
                })
            });
        }

        function styleHighlightFn() { return new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#00ffff', width: 8, lineCap: 'round', lineJoin: 'round' }) }); }

        // =========================================================
        // 3. CAPAS VECTORIALES
        // =========================================================
        var layerLimite = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosLimite) }), style: style_limite, zIndex: 20 });
        
        var featsMetroArterial = [];
        var featsMetroColectora = [];
        var featsMetroExpresa = [];
        var featsPref = [];
        var featsSecVehicular = [];
        var featsSecRestringido = [];
        var featsSecPasaje = [];
        var featsSecAlameda = [];

        var todosLocales = leerFeatures(datosLocales);
        
        todosLocales.forEach(function(f) {
            var p = f.getProperties();
            var clas = String(p.CLASIFIC || p.CLASIFICA || '').toLowerCase();
            var cat = String(getProp(p, 'CATEGORIA', 'CATEGOR\u00cdA') || '').toLowerCase();
            var subc = String(getProp(p, 'SUBCLASIFI', 'SUBCLASIFICACI\u00d3N') || '').toLowerCase();
            var nom = String(p.NOMBRE_FIN || p.NOMBRECOMP || p.NOMBRE || '').toLowerCase();
            var tipoMetro = obtenerTipoMetropolitano(p);

            if (tipoMetro) {
                if (tipoMetro === 'expresa') {
                    featsMetroExpresa.push(f);
                } else if (tipoMetro === 'arterial') {
                    featsMetroArterial.push(f);
                } else {
                    featsMetroColectora.push(f);
                }
            } else if (clas.includes('preferencial')) {
                featsPref.push(f);
            } else if (cat.includes('pasaje') || nom.includes('pasaje') || nom.startsWith('psj')) {
                featsSecPasaje.push(f);
            } else if (cat.includes('alameda') || nom.includes('alameda') || nom.startsWith('al.')) {
                featsSecAlameda.push(f);
            } else if (subc.includes('restr') || subc.includes('peaton')) {
                featsSecRestringido.push(f);
            } else {
                featsSecVehicular.push(f);
            }
        });

        var layerMetroArterial = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsMetroArterial }), style: styleMetroArterialFn, zIndex: 9, declutter: true });
        var layerMetroColectora = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsMetroColectora }), style: styleMetroColectoraFn, zIndex: 8, declutter: true });
        var layerMetroExpresa = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsMetroExpresa }), style: styleMetroExpresaFn, zIndex: 10, declutter: true });
        var layerPref = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsPref }), style: stylePrefFn, zIndex: 6, declutter: true });
        var layerSecVehicular = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecVehicular }), style: styleSecVehFn, zIndex: 5, declutter: true });
        var layerSecRestringido = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecRestringido }), style: styleSecResFn, zIndex: 5, declutter: true });
        var layerSecPasaje = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecPasaje }), style: styleSecPasFn, zIndex: 5, declutter: true });
        var layerSecAlameda = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecAlameda }), style: styleSecAlaFn, zIndex: 5, declutter: true });
        var layerSecciones = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSecciones) }), style: styleSeccionesFn, zIndex: 8, declutter: true });
        var layerSectores = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSectores) }), style: style_Sectores_2, zIndex: 2, declutter: true });
        var layerSubsectores = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSubsectores) }), style: style_subsectores_1, zIndex: 3, declutter: true });

        var featsTorresAlameda = [];
        var featsTorresPasaje = [];
        var featsTorresServidumbre = [];

        leerFeatures(datosTorresSanBorja).forEach(function(f) {
            var tipo = normalizarTextoPlano(f.get('Tipo') || '');
            if (tipo === 'alameda') {
                featsTorresAlameda.push(f);
            } else if (tipo === 'pasaje') {
                featsTorresPasaje.push(f);
            } else if (tipo.includes('servidumbre')) {
                featsTorresServidumbre.push(f);
            }
        });

        var layerTorresAlameda = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresAlameda }), style: style_EPIOFICIAL_0, zIndex: 4, declutter: true });
        var layerTorresPasaje = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresPasaje }), style: style_EPIOFICIAL_0, zIndex: 4, declutter: true });
        var layerTorresServidumbre = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresServidumbre }), style: style_EPIOFICIAL_0, zIndex: 4, declutter: true });

        var sourceHighlight = new ol.source.Vector();
        var layerHighlight = new ol.layer.Vector({ source: sourceHighlight, style: styleHighlightFn, zIndex: 12 });
