        // =========================================================
        // 6. BUSCADOR UNIVERSAL REESCRITO PARA OPENLAYERS
        // =========================================================
        var dictVias = [];
        var mapClasif = {};
        
        function indexarOLFeatures(featuresArray, flagMetro, tipoMetroForzado) {
            featuresArray.forEach(function(f) {
                var p = f.getProperties();
                if(!p || (!p.NOMBRE_FIN && !p.NOMBRECOMP && !p.NOMBRE)) return;

                var rawName = p.NOMBRE_FIN || p.NOMBRECOMP || p.NOMBRE || "";
                var n = fixMojibake(rawName);
                
                var nucleo = normalizarNucleoVia(n);
                if (!nucleo || nucleo === '-') return;

                var clasRaw = String(p.CLASIFIC || p.CLASIFICA || p.clasifica || "").toLowerCase();
                var subcRaw = String(getProp(p, 'SUBCLASIFI', 'SUBCLASIFICACI\u00d3N') || "").toLowerCase();
                var catRaw = String(getPropFlexible(p, 'Categoría', 'Categoria', 'CATEGORIA', 'CATEGOR\u00cdA') || "").toLowerCase();
                var tipoMetro = tipoMetroForzado || obtenerTipoMetropolitano(p);
                var esMetroReal = flagMetro || !!tipoMetro;
                
                var tipo;
                if (esMetroReal) {
                    if (tipoMetro === 'expresa') {
                        tipo = "Vía Metropolitana - Expresa";
                    } else if (tipoMetro === 'arterial') {
                        tipo = "Vía Metropolitana - Arterial";
                    } else if (tipoMetro === 'colectora') {
                        tipo = "Vía Metropolitana - Colectora";
                    } else {
                        tipo = "Vía Metropolitana";
                    }
                } else if (clasRaw.includes('preferencial')) {
                    tipo = "Vía Local Preferencial";
                } else if (catRaw.includes('pasaje') || nucleo.includes('pasaje')) {
                    tipo = "Pasaje";
                } else if (catRaw.includes('alameda') || nucleo.includes('alameda')) {
                    tipo = "Alameda";
                } else if (subcRaw.includes('restr') || subcRaw.includes('peaton')) {
                    tipo = "Vía Local Secundaria (Restringida)";
                } else {
                    tipo = "Vía Local Secundaria";
                }

                if (!mapClasif[nucleo]) {
                    mapClasif[nucleo] = { nombre: n, nucleo: nucleo, tipo: tipo, isMetro: esMetroReal, features: [f] };
                } else {
                    mapClasif[nucleo].features.push(f);
                    var tipoGuardado = mapClasif[nucleo].tipo;
                    if (tipoGuardado === "Vía Metropolitana" && tipo !== "Vía Metropolitana") {
                        mapClasif[nucleo].tipo = tipo; mapClasif[nucleo].isMetro = true;
                    } else if (tipo === "Vía Local Preferencial" && tipoGuardado.includes("Secundaria")) {
                        mapClasif[nucleo].tipo = tipo; mapClasif[nucleo].isMetro = false;
                    }
                }
            });
        }
        
        indexarOLFeatures(layerMetroArterial.getSource().getFeatures(), true, 'arterial');
        indexarOLFeatures(layerMetroColectora.getSource().getFeatures(), true, 'colectora');
        indexarOLFeatures(layerMetroExpresa.getSource().getFeatures(), true, 'expresa');
        indexarOLFeatures(layerPref.getSource().getFeatures(), false);
        indexarOLFeatures(layerSecVehicular.getSource().getFeatures(), false);
        indexarOLFeatures(layerSecRestringido.getSource().getFeatures(), false);
        indexarOLFeatures(layerSecPasaje.getSource().getFeatures(), false);
        indexarOLFeatures(layerSecAlameda.getSource().getFeatures(), false);
        indexarOLFeatures(layerJuanXXIIIAlameda.getSource().getFeatures(), false);
        indexarOLFeatures(layerLimatamboAlameda.getSource().getFeatures(), false);
        indexarOLFeatures(layerLimatamboCalle.getSource().getFeatures(), false);
        indexarOLFeatures(layerLimatamboJiron.getSource().getFeatures(), false);
        indexarOLFeatures(layerLimatamboPasaje.getSource().getFeatures(), false);
        indexarOLFeatures(layerLimatamboServidumbre.getSource().getFeatures(), false);
        indexarOLFeatures(layerLimatamboSubmanzana.getSource().getFeatures(), false);
        
        dictVias = Object.values(mapClasif);
        dictVias.sort((a,b) => a.nombre.localeCompare(b.nombre));

        // FIX DEFINITIVO DEL POPUP: Saca el contenedor de OpenLayers por encima del panel
        var fixZindex = document.createElement('style');
        fixZindex.textContent = '.ol-overlaycontainer-stopevent { z-index: 3000 !important; }';
        document.head.appendChild(fixZindex);

        var inputBuscador = document.getElementById('buscador-vias');
        var resDiv = document.getElementById('lista-resultados');
        var indiceSeleccionado = -1; 

        inputBuscador.addEventListener('input', function() {
            indiceSeleccionado = -1; 
            var safeValue = this.value.replace(/[<>"'`´=;()]/g, ""); 
            var inputVal = quitarTildes(safeValue);

            if(inputVal.length === 0) { resDiv.style.display = 'none'; return; }
            
            var filtrados = dictVias.filter(v => quitarTildes(v.nombre).includes(inputVal)).slice(0, 10);
            
            resDiv.textContent = ''; 
            
            if(filtrados.length === 0) {
                var noDiv = document.createElement('div');
                noDiv.style.cssText = 'padding:15px; color:#888; font-size:12px;';
                noDiv.textContent = 'No se encontraron vías.'; 
                resDiv.appendChild(noDiv);
            } else {
                filtrados.forEach((v, index) => {
                    var color = v.isMetro ? "#000fdb" : (v.tipo.toLowerCase().includes("pref") ? "#8e0500" : "#ffa763");
                    
                    var itemDiv = document.createElement('div');
                    itemDiv.className = 'resultado-item';
                    itemDiv.id = 'res-item-' + index;
                    itemDiv.style.borderLeftColor = color;
                    
                    var tituloSpan = document.createElement('span');
                    tituloSpan.className = 'res-titulo';
                    tituloSpan.textContent = v.nombre; 
                    
                    var subSpan = document.createElement('span');
                    subSpan.className = 'res-sub';
                    subSpan.textContent = v.tipo;
                    
                    itemDiv.appendChild(tituloSpan);
                    itemDiv.appendChild(subSpan);

                    itemDiv.onclick = function() { seleccionarDesdeBuscador(v.nombre); };

                    itemDiv.onmouseover = function() { actualizarSeleccionTeclado(index); };

                    resDiv.appendChild(itemDiv);
                });
            }
            resDiv.style.display = 'block';
        });

        // =========================================================
        // NAVEGACIÓN CON TECLADO (FLECHAS Y ENTER)
        // =========================================================
        inputBuscador.addEventListener('keydown', function(e) {
            var items = resDiv.getElementsByClassName('resultado-item');
            if (items.length === 0 || resDiv.style.display === 'none') return;

            if (e.key === 'ArrowDown') {
                e.preventDefault(); 
                indiceSeleccionado++;
                if (indiceSeleccionado >= items.length) indiceSeleccionado = 0; 
                actualizarSeleccionTeclado(indiceSeleccionado);
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                indiceSeleccionado--;
                if (indiceSeleccionado < 0) indiceSeleccionado = items.length - 1; 
                actualizarSeleccionTeclado(indiceSeleccionado);
            } 
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (indiceSeleccionado > -1 && indiceSeleccionado < items.length) {
                    items[indiceSeleccionado].click(); 
                } else if (items.length > 0) {
                    items[0].click(); 
                }
            }
        });

        function actualizarSeleccionTeclado(index) {
            var items = resDiv.getElementsByClassName('resultado-item');
            for (var i = 0; i < items.length; i++) {
                items[i].style.backgroundColor = ''; 
                items[i].style.borderLeftWidth = '4px';
            }

            if (index > -1 && index < items.length) {
                items[index].style.backgroundColor = '#f0fdf6'; 
                items[index].style.borderLeftWidth = '6px';
                // Hacer scroll automático si la lista es larga
                items[index].scrollIntoView({ block: 'nearest' }); 
                indiceSeleccionado = index;
            }
        }

        window.seleccionarDesdeBuscador = function(nombre) { 
            inputBuscador.value = nombre; 
            resDiv.style.display = 'none'; 
            inputBuscador.blur(); // Quitar foco para ocultar teclado numérico en móviles
            
            var featEncontrado = dictVias.find(v => v.nombre === nombre);
            if (featEncontrado && featEncontrado.features && featEncontrado.features.length > 0) {
                mostrarPopupFeature(featEncontrado.features[0], null, featEncontrado.features); 
            }
        };

