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
        var featsPrefAvenida = [];
        var featsPrefCalle = [];
        var featsPrefJiron = [];
        var featsPrefPasaje = [];
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
                if (cat.includes('pasaje') || nom.includes('pasaje') || nom.startsWith('psj')) {
                    featsPrefPasaje.push(f);
                } else if (cat.includes('jiron') || cat.includes('jirón') || nom.includes('jirón') || nom.includes('jiron') || nom.startsWith('jr')) {
                    featsPrefJiron.push(f);
                } else if (cat.includes('avenida') || nom.includes('avenida') || nom.startsWith('av')) {
                    featsPrefAvenida.push(f);
                } else {
                    featsPrefCalle.push(f);
                }
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
        var layerPrefAvenida = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsPrefAvenida }), style: stylePrefFn, zIndex: 6, declutter: true });
        var layerPrefCalle = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsPrefCalle }), style: stylePrefFn, zIndex: 6, declutter: true });
        var layerPrefJiron = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsPrefJiron }), style: stylePrefFn, zIndex: 6, declutter: true });
        var layerPrefPasaje = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsPrefPasaje }), style: stylePrefFn, zIndex: 6, declutter: true });
        var layerPref = new ol.layer.Group({ layers: [layerPrefAvenida, layerPrefCalle, layerPrefJiron, layerPrefPasaje] });
        var layerSecVehicular = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecVehicular }), style: styleSecVehFn, zIndex: 5, declutter: true });
        var layerSecRestringido = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecRestringido }), style: styleSecResFn, zIndex: 5, declutter: true });
        var layerSecPasaje = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecPasaje }), style: styleSecPasFn, zIndex: 5, declutter: true });
        var layerSecAlameda = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsSecAlameda }), style: styleSecAlaFn, zIndex: 5, declutter: true });
        var layerSecciones = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSecciones) }), style: styleSeccionesFn, zIndex: 8, declutter: true });
        var layerSectores = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSectores) }), style: style_Sectores_2, zIndex: 2, declutter: true });
        var layerSubsectores = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSubsectores) }), style: style_subsectores_1, zIndex: 3, declutter: true });
        var layerSectoresLabels = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSectores) }), style: style_Sectores_2_label, zIndex: 11 });
        var layerSubsectoresLabels = new ol.layer.Vector({ source: new ol.source.Vector({ features: leerFeatures(datosSubsectores) }), style: style_subsectores_1_label, zIndex: 11 });

        var featsTorresAlameda = [];
        var featsTorresPasaje = [];
        var featsTorresServidumbre = [];
        var featsTorresLotes = [];
        var featsTorresEpi = [];
        var featsJuanXXIIIAlameda = [];
        var featsJuanXXIIISubmanzana = [];
        var featsJuanXXIIISubmanzanaPoligono = [];
        var featsJuanXXIIIAreasLibresSubmanzana = [];
        var featsLimatamboAlameda = [];
        var featsLimatamboCalle = [];
        var featsLimatamboJiron = [];
        var featsLimatamboPasaje = [];
        var featsLimatamboServidumbre = [];
        var featsLimatamboSubmanzana = [];
        var featsLimatamboLotes = [];
        var featsLimatamboAreasTechadas = [];

        function styleTorresSanBorjaFn(feature, resolution) {
            if (feature.get('_sourceLayer') === 'alamedas_submanzanas' && typeof style_ALAMEDASDESUBMANZANAS_3 !== 'undefined') {
                return style_ALAMEDASDESUBMANZANAS_3(feature, resolution);
            }
            if (typeof style_PlantasdeAlamedasypasajes_2 !== 'undefined') {
                return style_PlantasdeAlamedasypasajes_2(feature, resolution);
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(35,35,35,1)', width: 2.28 }),
                fill: new ol.style.Fill({ color: 'rgba(208,28,66,0.45)' })
            });
        }

        function styleLimatamboFn(feature, resolution) {
            if (typeof style_PlantasdevasenLimatambo_0 !== 'undefined') {
                return style_PlantasdevasenLimatambo_0(feature, resolution);
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({ color: 'rgba(35,35,35,1)', width: 1 }),
                fill: new ol.style.Fill({ color: 'rgba(69,178,210,0.55)' })
            });
        }

        var pdfsLimatamboPorCodigo = {};
        if (Array.isArray(window.PDF_MANIFEST)) {
            window.PDF_MANIFEST.forEach(function(fileName) {
                var match = String(fileName).match(/^((?:SM|PSJ)-TL-\d+)/i);
                if (match) {
                    pdfsLimatamboPorCodigo[match[1].toUpperCase()] = fileName;
                }
            });
        }

        function obtenerPdfLimatambo(codigo) {
            return pdfsLimatamboPorCodigo[String(codigo || '').trim().toUpperCase()] || null;
        }

        function obtenerCodigoSubmanzanaLimatambo(manzana) {
            var numero = parseInt(manzana, 10);
            if (!isFinite(numero) || numero < 2 || numero > 22) return null;
            return 'SM-TL-' + String(numero - 1).padStart(2, '0');
        }

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

        if (datosLotesTorresSanBorja) {
            leerFeatures(datosLotesTorresSanBorja).forEach(function(f) {
                f.set('_sourceLayer', 'torres_lotes');
                featsTorresLotes.push(f);
            });
        }

        if (datosEpiTorresSanBorja) {
            leerFeatures(datosEpiTorresSanBorja).forEach(function(f) {
                f.set('_sourceLayer', 'torres_epi');
                featsTorresEpi.push(f);
            });
        }

        leerFeatures(datosAlamedasSubmanzanas).forEach(function(f) {
            f.set('_sourceLayer', 'alamedas_submanzanas');
            f.set('_grupoEspecial', 'Papa Juan XXIII');
            f.set('Tipo', f.get('Tipo') || 'Alameda');
            f.set('NOMBRE', f.get('NOMBRE') || f.get('NOMBRE_1') || '-');
            featsJuanXXIIIAlameda.push(f);
        });

        if (typeof json_BORDEDESUBMANZANAYREALIBRE_7 !== 'undefined') {
            leerFeatures(json_BORDEDESUBMANZANAYREALIBRE_7).forEach(function(f) {
                f.set('_sourceLayer', 'juan_xxiii_submanzana');
                featsJuanXXIIISubmanzana.push(f);
            });
        }

        if (typeof json_SUBMANZANAS_1 !== 'undefined') {
            leerFeatures(json_SUBMANZANAS_1).forEach(function(f) {
                f.set('_sourceLayer', 'juan_xxiii_submanzana_poligono');
                featsJuanXXIIISubmanzanaPoligono.push(f);
            });
        }

        if (typeof json_AREASLIBRESDESUBMANZANAS_0 !== 'undefined') {
            leerFeatures(json_AREASLIBRESDESUBMANZANAS_0).forEach(function(f) {
                f.set('_sourceLayer', 'juan_xxiii_areas_libres_submanzana');
                featsJuanXXIIIAreasLibresSubmanzana.push(f);
            });
        }

        if (datosPlantasLimatambo) {
            leerFeatures(datosPlantasLimatambo).forEach(function(f) {
                var categoria = getPropFlexible(f.getProperties(), 'Categoría', 'Categoria', 'CATEGORÍA', 'CATEGORIA') || '';
                var tipo = normalizarTextoPlano(categoria);
                f.set('_grupoEspecial', 'Torres de Limatambo');
                f.set('Tipo', categoria || '-');
                f.set('NOMBRE', f.get('Nombre') || f.get('NOMBRE') || '-');
                f.set('CODIGO', getPropFlexible(f.getProperties(), 'Código', 'CODIGO', 'CÓDIGO') || '-');
                f.set('CLASIFICAC', f.get('Clasificac') || f.get('CLASIFICAC') || '-');
                var pdfLimatambo = obtenerPdfLimatambo(f.get('CODIGO'));
                if (pdfLimatambo && !f.get('Linkvercel') && !f.get('LINKVERCEL')) {
                    f.set('Linkvercel', pdfLimatambo);
                }
                if (tipo === 'alameda') {
                    featsLimatamboAlameda.push(f);
                } else if (tipo === 'calle') {
                    featsLimatamboCalle.push(f);
                } else if (tipo === 'jiron') {
                    featsLimatamboJiron.push(f);
                } else if (tipo === 'pasaje') {
                    featsLimatamboPasaje.push(f);
                } else if (tipo.includes('servidumbre')) {
                    featsLimatamboServidumbre.push(f);
                }
            });
        }

        if (datosManzanasLimatambo) {
            leerFeatures(datosManzanasLimatambo).forEach(function(f) {
                var codigoSubmanzana = obtenerCodigoSubmanzanaLimatambo(f.get('Manzana'));
                var pdfSubmanzana = obtenerPdfLimatambo(codigoSubmanzana);
                f.set('_grupoEspecial', 'Torres de Limatambo');
                f.set('Tipo', 'Submanzana');
                f.set('NOMBRE', 'Submanzana ' + (f.get('Manzana') || '-'));
                f.set('CODIGO', codigoSubmanzana || f.get('Manzana') || '-');
                if (pdfSubmanzana) {
                    f.set('Linkvercel', pdfSubmanzana);
                }
                featsLimatamboSubmanzana.push(f);
            });
        }

        if (datosLotesLimatambo) {
            leerFeatures(datosLotesLimatambo).forEach(function(f) {
                f.set('_sourceLayer', 'limatambo_lotes');
                featsLimatamboLotes.push(f);
            });
        }

        if (datosAreasTechadasLimatambo) {
            leerFeatures(datosAreasTechadasLimatambo).forEach(function(f) {
                f.set('_sourceLayer', 'limatambo_areas_techadas');
                featsLimatamboAreasTechadas.push(f);
            });
        }

        var layerTorresLotes = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresLotes }), style: typeof style_Lotes_0 !== 'undefined' ? style_Lotes_0 : styleHighlightFn, zIndex: 3.8, declutter: true });
        var layerTorresEpi = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresEpi }), style: typeof style_EPI_TorresdeSanBorja_2 !== 'undefined' ? style_EPI_TorresdeSanBorja_2 : styleHighlightFn, zIndex: 3.7, declutter: true });
        var layerTorresAlameda = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresAlameda }), style: styleTorresSanBorjaFn, zIndex: 4, declutter: true });
        var layerTorresPasaje = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresPasaje }), style: styleTorresSanBorjaFn, zIndex: 4, declutter: true });
        var layerTorresServidumbre = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsTorresServidumbre }), style: styleTorresSanBorjaFn, zIndex: 4, declutter: true });
        var layerJuanXXIIIAlameda = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsJuanXXIIIAlameda }), style: styleTorresSanBorjaFn, zIndex: 5, declutter: true });
        var layerJuanXXIIISubmanzana = new ol.layer.Vector({
            source: new ol.source.Vector({ features: featsJuanXXIIISubmanzana }),
            style: typeof style_BORDEDESUBMANZANAYREALIBRE_7 !== 'undefined' ? style_BORDEDESUBMANZANAYREALIBRE_7 : styleHighlightFn,
            zIndex: 4.3,
            declutter: true
        });
        var layerJuanXXIIISubmanzanaPoligono = new ol.layer.Vector({
            source: new ol.source.Vector({ features: featsJuanXXIIISubmanzanaPoligono }),
            style: typeof style_SUBMANZANAS_1 !== 'undefined' ? style_SUBMANZANAS_1 : styleHighlightFn,
            zIndex: 4.2,
            declutter: true
        });
        var layerJuanXXIIIAreasLibresSubmanzana = new ol.layer.Vector({
            source: new ol.source.Vector({ features: featsJuanXXIIIAreasLibresSubmanzana }),
            style: typeof style_AREASLIBRESDESUBMANZANAS_0 !== 'undefined' ? style_AREASLIBRESDESUBMANZANAS_0 : styleHighlightFn,
            zIndex: 4,
            declutter: true
        });
        var layerLimatamboAlameda = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboAlameda }), style: styleLimatamboFn, zIndex: 4.7, declutter: true });
        var layerLimatamboCalle = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboCalle }), style: styleLimatamboFn, zIndex: 4.7, declutter: true });
        var layerLimatamboJiron = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboJiron }), style: styleLimatamboFn, zIndex: 4.7, declutter: true });
        var layerLimatamboPasaje = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboPasaje }), style: styleLimatamboFn, zIndex: 4.7, declutter: true });
        var layerLimatamboServidumbre = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboServidumbre }), style: styleLimatamboFn, zIndex: 4.7, declutter: true });
        var layerLimatamboAreasTechadas = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboAreasTechadas }), style: typeof style_reastechadas_3 !== 'undefined' ? style_reastechadas_3 : styleHighlightFn, zIndex: 4.35, declutter: true });
        var layerLimatamboLotes = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboLotes }), style: typeof style_Lotes_Limatambo_2 !== 'undefined' ? style_Lotes_Limatambo_2 : styleHighlightFn, zIndex: 4.4, declutter: true });
        var layerLimatamboSubmanzana = new ol.layer.Vector({ source: new ol.source.Vector({ features: featsLimatamboSubmanzana }), style: typeof style_Manzanas_Limatambo_1 !== 'undefined' ? style_Manzanas_Limatambo_1 : styleHighlightFn, zIndex: 4.45, declutter: true });

        var sourceHighlight = new ol.source.Vector();
        var layerHighlight = new ol.layer.Vector({ source: sourceHighlight, style: styleHighlightFn, zIndex: 12 });
