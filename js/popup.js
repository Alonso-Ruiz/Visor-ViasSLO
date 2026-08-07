        // =========================================================
        // 4. POPUP Y CIBERSEGURIDAD
        // =========================================================
        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');
        var overlay = new ol.Overlay({ element: container, autoPan: true, positioning: 'bottom-center', offset: [0, -10] });
        map.addOverlay(overlay);

        closer.onclick = function() { overlay.setPosition(undefined); closer.blur(); sourceHighlight.clear(); return false; };

        function crearFilaSegura(tablaDOM, etiqueta, valor) {
            if (valor && valor !== "-" && String(valor).trim() !== "") {
                var tr = document.createElement('tr');
                var th = document.createElement('th');
                th.textContent = etiqueta;
                var td = document.createElement('td');
                td.textContent = valor;
                tr.appendChild(th);
                tr.appendChild(td);
                tablaDOM.appendChild(tr);
            }
        }

        function mostrarPopupSector(feature, coordinate, tipo) {
            sourceHighlight.clear();
            sourceHighlight.addFeature(feature);

            var p = feature.getProperties();
            var esSubsector = tipo === 'subsector';
            var titulo = esSubsector ? 'Subsector ' + (p.RefName || '-') : 'Sector ' + (p.Sectores || '-');

            content.textContent = '';

            var titleDiv = document.createElement('div');
            titleDiv.className = 'popup-titulo';
            titleDiv.textContent = titulo;
            content.appendChild(titleDiv);

            var tabla = document.createElement('table');
            tabla.className = 'popup-tabla';

            if (esSubsector) {
                crearFilaSegura(tabla, 'Subsector', p.RefName || '-');
                crearFilaSegura(tabla, 'Área', p.AREA ? Number(p.AREA).toLocaleString('es-PE') + ' m²' : '-');
            } else {
                crearFilaSegura(tabla, 'Sector', p.Sectores || '-');
                crearFilaSegura(tabla, 'Población 2024', p.POB__2024 ? Number(p.POB__2024).toLocaleString('es-PE') : '-');
                crearFilaSegura(tabla, 'Área', p.AREA ? Number(p.AREA).toLocaleString('es-PE') + ' m²' : '-');
            }

            content.appendChild(tabla);
            overlay.setPosition(coordinate);
        }

        function mostrarPopupTorres(feature, coordinate) {
            sourceHighlight.clear();
            sourceHighlight.addFeature(feature);

            var p = feature.getProperties();
            var tipoRaw = p.Tipo || getProp(p, 'CATEGORIA', 'CATEGORÍA') || '-';
            var tipo = tipoRaw === 'Paso de servidumbre' ? 'Servidumbre de paso' : tipoRaw;

            content.textContent = '';

            var titleDiv = document.createElement('div');
            titleDiv.className = 'popup-titulo';
            titleDiv.textContent = p._grupoEspecial || 'Torres de San Borja';
            content.appendChild(titleDiv);

            var tabla = document.createElement('table');
            tabla.className = 'popup-tabla';
            crearFilaSegura(tabla, 'Tipo', fixMojibake(tipo));
            crearFilaSegura(tabla, 'Nombre', fixMojibake(p.NOMBRE || p.NOMBRE_1 || '-'));
            var codigo = getProp(p, 'CODIGO', 'C\u00d3DIGO', 'CÃ“DIGO') || '-';
            crearFilaSegura(tabla, 'Codigo', codigo);
            crearFilaSegura(tabla, 'Clasificacion', p.CLASIFICAC || '-');
            crearFilaSegura(tabla, 'Area', p.AREA ? Number(p.AREA).toLocaleString('es-PE') + ' m2' : '-');

            content.appendChild(tabla);

            var linkRaw = obtenerLinkDocumento(p, null);
            var urlPdf = construirUrlDocumento(linkRaw, codigo);
            if (urlPdf) {
                var btn = document.createElement('a');
                btn.href = urlPdf;
                btn.target = "_blank";
                btn.rel = "noopener noreferrer";
                btn.className = "btn-pdf";
                btn.style.marginTop = "15px";
                btn.textContent = "VER PLANTA (PDF)";
                content.appendChild(btn);
            }

            overlay.setPosition(coordinate);
        }

        var pdfManifest = Array.isArray(window.PDF_MANIFEST) ? window.PDF_MANIFEST : [];
        var pdfManifestPorNombre = {};
        var pdfManifestPorCodigo = {};
        var pdfManifestPorTitulo = {};

        pdfManifest.forEach(function(fileName) {
            var lower = String(fileName).toLowerCase();
            pdfManifestPorNombre[lower] = fileName;

            var codeMatch = String(fileName).match(/^([A-Z]{3}-[A-Z]{2}-[0-9A-Z]+)(?:_|\.pdf$)/i);
            if (codeMatch) {
                var code = codeMatch[1].toUpperCase();
                if (!pdfManifestPorCodigo[code]) {
                    pdfManifestPorCodigo[code] = fileName;
                }
            }

            var titleKey = normalizarNombrePdf(fileName);
            if (titleKey && !pdfManifestPorTitulo[titleKey]) {
                pdfManifestPorTitulo[titleKey] = fileName;
            }
        });

        function obtenerNombrePdf(valorLink) {
            var cleaned = String(valorLink || '').trim();
            if (!cleaned || cleaned === '-' || /^https?:\/\//i.test(cleaned)) return null;

            cleaned = cleaned.replace(/\\/g, '/');
            var leaf = cleaned.split('/').pop();
            if (!leaf) return null;
            if (!/\.pdf(?:$|[?#])/i.test(leaf)) leaf += ".pdf";
            return leaf;
        }

        function normalizarNombrePdf(fileName) {
            var base = String(fileName || '').replace(/\.pdf$/i, '');
            base = base.replace(/^[A-Z]{3}-[A-Z]{2}-[0-9A-Z]+_?/i, '');
            return quitarTildes(base)
                .replace(/[^a-z0-9]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function construirUrlPdfLocal(valorLink, codigo) {
            var fileName = obtenerNombrePdf(valorLink);
            if (fileName) {
                var exact = pdfManifestPorNombre[fileName.toLowerCase()];
                if (exact) return "pdf/" + exact;
            }

            var code = String(codigo || '').trim().toUpperCase();
            if (code && code !== "-" && pdfManifestPorCodigo[code]) {
                return "pdf/" + pdfManifestPorCodigo[code];
            }

            if (fileName) {
                var byTitle = pdfManifestPorTitulo[normalizarNombrePdf(fileName)];
                if (byTitle) return "pdf/" + byTitle;
            }

            return fileName ? "pdf/" + fileName : null;
        }

        function obtenerLinkDocumento(props, fallbackProps) {
            return props.LINKVERCEL || props.linkvercel ||
                (fallbackProps ? (fallbackProps.LINKVERCEL || fallbackProps.linkvercel) : '') ||
                props.LINK || props.link || getProp(props, 'SECCI\u00d3N_') ||
                (fallbackProps ? (fallbackProps.LINK || fallbackProps.link || getProp(fallbackProps, 'SECCI\u00d3N_')) : null) ||
                '';
        }

        function construirUrlDocumento(valorLink, codigo) {
            var cleaned = String(valorLink || '').trim();
            if (!cleaned || cleaned === '-') return null;

            var localPdf = construirUrlPdfLocal(cleaned, codigo);
            if (localPdf) return localPdf;

            if (/^https?:\/\//i.test(cleaned)) {
                return esURLSegura(cleaned) ? cleaned : null;
            }

            if (/^pdf\//i.test(cleaned)) {
                var localPdf = cleaned.replace(/^\/+/, '');
                return /\.pdf(?:$|[?#])/i.test(localPdf) ? localPdf : localPdf + ".pdf";
            }

            if (/\.pdf(?:$|[?#])/i.test(cleaned)) {
                return "pdf/" + cleaned.replace(/^\/+/, '');
            }

            return "https://drive.google.com/file/d/" + cleaned + "/preview";
        }

       function mostrarPopupFeature(feature, coordinate, arrayDeTramosAdicionales) {
            sourceHighlight.clear();
            var p = feature.getProperties();
            var codigoClic = String(getProp(p, 'CODIGO', 'C\u00d3DIGO') || '').trim().toUpperCase();
            var extentTotal = ol.extent.createEmpty();

            var pSec = null;
            if (codigoClic && codigoClic !== "-") {
                var secFeatures = layerSecciones.getSource().getFeatures();
                for (var i = 0; i < secFeatures.length; i++) {
                    var fProps = secFeatures[i].getProperties();
                    var fCod = String(getProp(fProps, 'CODIGO', 'C\u00d3DIGO') || '').trim().toUpperCase();
                    if (fCod === codigoClic) {
                        pSec = fProps;
                        ol.extent.extend(extentTotal, secFeatures[i].getGeometry().getExtent());
                        break;
                    }
                }
            }

            if (arrayDeTramosAdicionales && arrayDeTramosAdicionales.length > 0) {
                arrayDeTramosAdicionales.forEach(f => {
                    sourceHighlight.addFeature(f);
                    if(f.getGeometry()) ol.extent.extend(extentTotal, f.getGeometry().getExtent());
                });
            } else {
                sourceHighlight.addFeature(feature);
                if(feature.getGeometry()) ol.extent.extend(extentTotal, feature.getGeometry().getExtent());
            }

            // ==========================================
            // DETECCIÓN INTELIGENTE DEL CONTEXTO
            // ==========================================
            var esSeleccionMultiple = (coordinate !== null && arrayDeTramosAdicionales && arrayDeTramosAdicionales.length > 1);

            var esBusquedaMultiple = (coordinate === null && arrayDeTramosAdicionales && arrayDeTramosAdicionales.length > 1);

            var nombreFinal = p.NOMBRE_FIN || p.NOMBRECOMP || p.NOMBRE || (pSec ? pSec.NOMBRE : null) || "Vía sin nombre";

            if (esSeleccionMultiple) {
                nombreFinal = "Selección Múltiple";
            }

            var clasificacion = p.CLASIFIC || p.CLASIFICA || p.NIVEL || (pSec ? pSec.CLASIFICA : null) || "-";
            var subclasif = getProp(p, 'SUBCLASIFI', 'SUBCLASIFICACI\u00d3N') || '-';
            var codigoFinal = codigoClic || (pSec ? getProp(pSec, 'CODIGO', 'C\u00d3DIGO') : '-');
            var tramo = p.TRAMO || (pSec ? pSec.TRAMO : null) || "-";
            var anchoRaw = p.ANCHO || p.ANCHO2 || (pSec ? (pSec.ANCHO || pSec.ANCHO2) : null) || "-";
            var linkRaw = obtenerLinkDocumento(p, pSec);

            var tipoMetro = obtenerTipoMetropolitano(p) || (pSec ? obtenerTipoMetropolitano(pSec) : "");
            var esMetropolitana = !!tipoMetro || (p.NIVEL && !String(p.NIVEL).toUpperCase().includes('LOCALES')) || (String(clasificacion).toUpperCase().includes('METROPOLITANA')) ? true : false;
            if (esMetropolitana) { clasificacion = "Vía Metropolitana"; subclasif = etiquetaTipoMetropolitano(tipoMetro) || "-"; }

            var anchoFormat = String(anchoRaw).trim();
            if (anchoFormat !== "-" && anchoFormat !== "") {
                if (!isNaN(parseFloat(anchoFormat))) anchoFormat += " metros";
            }

            content.textContent = ''; 

            var titleDiv = document.createElement('div');
            titleDiv.className = 'popup-titulo';
            titleDiv.textContent = fixMojibake(nombreFinal); 
            content.appendChild(titleDiv);

            if (!esSeleccionMultiple) {
                // ==========================================
                // MODO: UN SOLO TRAMO O BÚSQUEDA DE UNA VÍA
                // ==========================================
                var tabla = document.createElement('table');
                tabla.className = 'popup-tabla';
                
                crearFilaSegura(tabla, 'Clasificación', fixMojibake(clasificacion));
                crearFilaSegura(tabla, 'Subclasific.', fixMojibake(subclasif));
                crearFilaSegura(tabla, 'Código', fixMojibake(codigoFinal));

                var linksUnicos = [];
                var tramosConLinks = [];

                if (!esMetropolitana && esBusquedaMultiple) {
                    arrayDeTramosAdicionales.forEach(function(feat) {
                        var props = feat.getProperties();
                        var cod = String(getProp(props, 'CODIGO', 'C\u00d3DIGO') || '').trim().toUpperCase();
                        var l = obtenerLinkDocumento(props, null);
                        var nombreTramo = props.TRAMO || "-";
                        
                        if ((!l || l === "-") && cod !== "-") {
                            var secFeatures = layerSecciones.getSource().getFeatures();
                            for (var i = 0; i < secFeatures.length; i++) {
                                var fProps = secFeatures[i].getProperties();
                                var fCod = String(getProp(fProps, 'CODIGO', 'C\u00d3DIGO') || '').trim().toUpperCase();
                                if (fCod === cod) {
                                    if (!l || l === "-") l = obtenerLinkDocumento(fProps, null);
                                    nombreTramo = fProps.TRAMO || nombreTramo;
                                    break;
                                }
                            }
                        }
                        
                        if (l && String(l).trim() !== "" && l !== "-") {
                            var urlFinal = construirUrlDocumento(l, cod);
                            if (urlFinal && !linksUnicos.includes(urlFinal)) {
                                linksUnicos.push(urlFinal);
                                tramosConLinks.push({ url: urlFinal, tramo: fixMojibake(nombreTramo), tipo: 'Seccion vial' });
                            }
                        }

                    });
                } else if (!esMetropolitana && linkRaw && String(linkRaw).trim() !== "" && linkRaw !== "-") {
                    var urlFinal = construirUrlDocumento(linkRaw, codigoFinal);
                    if (urlFinal) {
                        linksUnicos.push(urlFinal);
                        tramosConLinks.push({ url: urlFinal, tramo: fixMojibake(tramo), tipo: 'Seccion vial' });
                    }

                }

                var mostrarMultiples = (!esMetropolitana && esBusquedaMultiple && linksUnicos.length > 1);
                var tramoMostrar = mostrarMultiples ? "Múltiples tramos (ver abajo)" : fixMojibake(tramo);
                var anchoMostrar = mostrarMultiples ? "Variable según tramo" : fixMojibake(anchoFormat);

                crearFilaSegura(tabla, 'Tramo', tramoMostrar);
                crearFilaSegura(tabla, 'Ancho Norm.', anchoMostrar);
                if (String(codigoFinal || '').trim().toUpperCase() === 'VLP-JR-53H') {
                    crearFilaSegura(tabla, 'Concejo', 'ACUERDO DE CONCEJO N° 053-2012-MSB-C');
                }
                content.appendChild(tabla);

                // ==========================================
                // RENDERIZAR NOTAS O BOTONES DE DESCARGA
                // ==========================================
                if (esMetropolitana) {
                    var noteDiv = document.createElement('div');
                    noteDiv.style.cssText = 'margin-top:12px; font-size:11.5px; color:#444; text-align:justify; background-color:#f0fdf6; padding:10px; border-radius:4px; border-left: 4px solid #00975D;';
                    noteDiv.textContent = 'Nota: Esta vía forma parte del Sistema Vial Metropolitano de Lima; por ello, su sección vial normativa no se muestra en este visor. Sus características y secciones se encuentran establecidos en la Ordenanza N° 341-MML y sus adendas.'; 
                    content.appendChild(noteDiv);
                } else if (linksUnicos.length > 0) {
                    var linksContainer = document.createElement('div');
                    
                    if (linksUnicos.length > 1) {
                        linksContainer.style.cssText = 'max-height: 140px; overflow-y: auto; margin-top: 12px; border-top: 1px dashed #eee; padding-top: 10px; background-color: #fcfcfc; border-radius: 4px;';
                        var tituloLinks = document.createElement('div');
                        tituloLinks.style.cssText = 'font-size: 11.5px; color: #555; text-align: center; margin-bottom: 8px; font-weight: bold;';
                        tituloLinks.textContent = 'Esta via cuenta con ' + linksUnicos.length + ' documentos normativos:';
                        linksContainer.appendChild(tituloLinks);
                    } else {
                        linksContainer.style.marginTop = '15px';
                    }

                    tramosConLinks.forEach(function(item, index) {
                        var aBtn = document.createElement('a');
                        aBtn.href = item.url;
                        aBtn.target = "_blank";
                        aBtn.rel = "noopener noreferrer"; 
                        aBtn.className = "btn-pdf";
                        
                        if (linksUnicos.length > 1) {
                            aBtn.style.margin = '6px 10px';
                            aBtn.style.padding = '8px';
                            aBtn.style.fontSize = '11px';
                            aBtn.title = item.tramo; 
                            var textoTramo = item.tramo !== "-" ? item.tramo : "Tramo " + (index + 1);
                            if (textoTramo.length > 28) textoTramo = textoTramo.substring(0, 28) + "...";
                            aBtn.textContent = item.tipo + " - " + textoTramo;
                        } else {
                            aBtn.textContent = "VER SECCION VIAL (PDF)";
                        }
                        linksContainer.appendChild(aBtn);
                    });
                    content.appendChild(linksContainer);
                } else {
                    var noteDiv2 = document.createElement('div');
                    noteDiv2.style.cssText = 'margin-top:10px; padding:10px; font-size:11px; color:#888; text-align:center; font-style:italic;';
                    noteDiv2.textContent = 'Este tramo no cuenta con archivo normativo adjunto.'; 
                    content.appendChild(noteDiv2);
                }

            } else {
                // ==========================================
                // MODO: SELECCIÓN MÚLTIPLE (CLIC DERECHO)
                // ==========================================
                var nombresUnicos = [];
                arrayDeTramosAdicionales.forEach(function(f) {
                    var pr = f.getProperties();
                    var nom = pr.NOMBRE_FIN || pr.NOMBRECOMP || pr.NOMBRE || "Vía sin nombre";
                    var nomClean = fixMojibake(nom);
                    if (nomClean !== "-" && !nombresUnicos.includes(nomClean)) {
                        nombresUnicos.push(nomClean);
                    }
                });
                
                var multiDiv = document.createElement('div');
                multiDiv.style.cssText = 'padding:12px; font-size:12px; color:#333; background-color:#ffffff; margin-top: 5px;';
                
                var summaryDiv = document.createElement('div');
                summaryDiv.className = 'multi-selection-summary';
                summaryDiv.textContent = arrayDeTramosAdicionales.length + ' Tramos Seleccionados';
                multiDiv.appendChild(summaryDiv);

                var labelDiv = document.createElement('div');
                labelDiv.className = 'multi-selection-label';
                labelDiv.textContent = 'Vías identificadas (' + nombresUnicos.length + '):';
                multiDiv.appendChild(labelDiv);

                var listDiv = document.createElement('div');
                listDiv.className = 'multi-selection-list';
                var list = document.createElement('ul');
                list.className = 'multi-selection-items';
                nombresUnicos.forEach(function(n) {
                    var item = document.createElement('li');
                    item.textContent = n;
                    list.appendChild(item);
                });
                listDiv.appendChild(list);
                multiDiv.appendChild(listDiv);

                var noteDiv = document.createElement('div');
                noteDiv.className = 'multi-selection-note';
                noteDiv.textContent = '* Seleccione una vía de forma individual para descargar su archivo de sección normativa.';
                multiDiv.appendChild(noteDiv);
                content.appendChild(multiDiv);
            }

           // ==========================================
            // CENTRADO INTELIGENTE (RESPONSIVE)
            // ==========================================
            var puntoCentrado;

            if (coordinate) {
                puntoCentrado = coordinate;
                overlay.setPosition(coordinate);
            } else if (!ol.extent.isEmpty(extentTotal)) {
                var centerBoundingBox = ol.extent.getCenter(extentTotal);
                puntoCentrado = centerBoundingBox;
                if (feature.getGeometry()) {
                    puntoCentrado = feature.getGeometry().getClosestPoint(centerBoundingBox);
                }
                overlay.setPosition(puntoCentrado);
            }

            var popupDOM = document.getElementById('popup');
            if (popupDOM) popupDOM.style.zIndex = '3000';

            if (puntoCentrado) {
                var pointExtent = [puntoCentrado[0], puntoCentrado[1], puntoCentrado[0], puntoCentrado[1]];
                
                var anchoP = map.getSize() ? map.getSize()[0] : window.innerWidth;
                var altoP = map.getSize() ? map.getSize()[1] : window.innerHeight;
                var isMobile = anchoP <= 896;
                
                var panelUsos = document.getElementById('panel-usos');
                var panelDerechoAbierto = panelUsos && !panelUsos.classList.contains('oculto');
                
                var pTop = 50, pRight = 50, pBottom = 50, pLeft = 50;

                if (isMobile) {
                    if (panelDerechoAbierto) {
                        pBottom = (altoP * 0.65) + 40; 
                    } else {
                        pBottom = 120;
                    }
                    pTop = 80;
                } else {
                    pLeft = 380; 
                    if (panelDerechoAbierto) {
                        pRight = 560; 
                    } else {
                        pRight = 200; 
                    }
                    pTop = 150; 
                    pBottom = 80;
                }

                if ((pLeft + pRight) >= (anchoP - 20)) {
                    pLeft = 20; 
                    if (pRight >= (anchoP - 20)) {
                        pRight = anchoP / 2;
                    }
                }
                if ((pTop + pBottom) >= (altoP - 20)) {
                    pTop = 20;
                    if (pBottom >= (altoP - 20)) {
                        pBottom = altoP / 2;
                    }
                }

                var zoomActual = map.getView().getZoom();
                var zoomDestino = zoomActual > 16.5 ? zoomActual : 16.5;

                map.getView().fit(pointExtent, { 
                    padding: [pTop, pRight, pBottom, pLeft], 
                    maxZoom: zoomDestino, 
                    duration: 500 
                });
            }
        } 
