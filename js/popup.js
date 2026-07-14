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

        function construirUrlDocumento(valorLink) {
            var cleaned = String(valorLink || '').trim();
            if (!cleaned || cleaned === '-') return null;

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
            var linkRaw = p.LINK || p.link || getProp(p, 'SECCI\u00d3N_') || (pSec ? (pSec.LINK || pSec.link || getProp(pSec, 'SECCI\u00d3N_')) : null) || '';

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
                        var l = props.LINK || props.link || getProp(props, 'SECCI\u00d3N_') || '';
                        var nombreTramo = props.TRAMO || "-";
                        
                        if ((!l || l === "-") && cod !== "-") {
                            var secFeatures = layerSecciones.getSource().getFeatures();
                            for (var i = 0; i < secFeatures.length; i++) {
                                var fProps = secFeatures[i].getProperties();
                                var fCod = String(getProp(fProps, 'CODIGO', 'C\u00d3DIGO') || '').trim().toUpperCase();
                                if (fCod === cod) {
                                    l = fProps.LINK || fProps.link || getProp(fProps, 'SECCI\u00d3N_') || '';
                                    nombreTramo = fProps.TRAMO || nombreTramo;
                                    break;
                                }
                            }
                        }
                        
                        if (l && String(l).trim() !== "" && l !== "-") {
                            var urlFinal = construirUrlDocumento(l);
                            if (urlFinal && !linksUnicos.includes(urlFinal)) {
                                linksUnicos.push(urlFinal);
                                tramosConLinks.push({ url: urlFinal, tramo: fixMojibake(nombreTramo) });
                            }
                        }
                    });
                } else if (!esMetropolitana && linkRaw && String(linkRaw).trim() !== "" && linkRaw !== "-") {
                    var urlFinal = construirUrlDocumento(linkRaw);
                    if (urlFinal) {
                        linksUnicos.push(urlFinal);
                        tramosConLinks.push({ url: urlFinal, tramo: fixMojibake(tramo) });
                    }
                }

                var mostrarMultiples = (!esMetropolitana && esBusquedaMultiple && linksUnicos.length > 1);
                var tramoMostrar = mostrarMultiples ? "Múltiples tramos (ver abajo)" : fixMojibake(tramo);
                var anchoMostrar = mostrarMultiples ? "Variable según tramo" : fixMojibake(anchoFormat);

                crearFilaSegura(tabla, 'Tramo', tramoMostrar);
                crearFilaSegura(tabla, 'Ancho Norm.', anchoMostrar);
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
                        tituloLinks.textContent = 'Esta vía cuenta con ' + linksUnicos.length + ' secciones normativas:';
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
                            aBtn.textContent = "📄 " + textoTramo;
                        } else {
                            aBtn.textContent = "📄 VER SECCIÓN VIAL (PDF)";
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
