var estadoBootstrap = window.__visorBootstrap || null;
var visorListo = Boolean(estadoBootstrap && estadoBootstrap.mapReady);
var usuarioSolicitoEntrar = Boolean(estadoBootstrap && estadoBootstrap.userRequestedEntry);

function cerrarPortadaReal() {
                var modal = document.getElementById('welcome-modal');
                if(modal) { modal.style.opacity = '0'; setTimeout(function() { modal.style.display = 'none'; }, 400); }
                mostrarInfoTitulo(30000, { mantenerAyuda: true });
            }

            function cerrarPortada() {
                if (!visorListo) {
                    usuarioSolicitoEntrar = true;
                    var modal = document.getElementById('welcome-modal');
                    var boton = document.getElementById('btn-ingresar-visor');
                    if (modal) modal.setAttribute('aria-busy', 'true');
                    if (boton) {
                        boton.textContent = 'Preparando visor…';
                        boton.classList.add('is-preparing');
                    }
                    return;
                }
                cerrarPortadaReal();
            }

            function marcarVisorListo() {
                if (visorListo) return;
                visorListo = true;
                if (estadoBootstrap) {
                    estadoBootstrap.mapReady = true;
                    usuarioSolicitoEntrar = usuarioSolicitoEntrar || estadoBootstrap.userRequestedEntry;
                }
                document.documentElement.setAttribute('data-visor-ready-ms', String(Math.round(performance.now())));
                var modal = document.getElementById('welcome-modal');
                var boton = document.getElementById('btn-ingresar-visor');
                if (modal) modal.setAttribute('aria-busy', 'false');
                if (boton) {
                    boton.textContent = 'Ingresar al visor';
                    boton.classList.remove('is-preparing');
                }
                if (usuarioSolicitoEntrar) cerrarPortadaReal();
            }
            function toggleDef(id) {
                var el = document.getElementById(id);
                if (el) el.classList.toggle('active');
            }

            var titleInfoTimer = null;
            var titleHintTimer = null;

            function ocultarInfoTitulo() {
                var anexos = document.getElementById('anexos-detalle');
                if (anexos && anexos.open) {
                    mostrarInfoTitulo(50000);
                    return;
                }
                var title = document.getElementById('title-container');
                if (title) title.classList.add('title-hidden');
                mostrarAyudaInfoTitulo(9000);
            }

            function mostrarInfoTitulo(duration, options) {
                var title = document.getElementById('title-container');
                if (!title) return;
                title.classList.remove('title-hidden');
                if (!options || !options.mantenerAyuda) {
                    ocultarAyudaInfoTitulo();
                }
                if (titleInfoTimer) window.clearTimeout(titleInfoTimer);
                if (duration) {
                    titleInfoTimer = window.setTimeout(ocultarInfoTitulo, duration);
                }
            }

            function ocultarAyudaInfoTitulo() {
                var hint = document.getElementById('info-title-hint');
                if (hint) hint.classList.remove('is-visible');
                if (titleHintTimer) window.clearTimeout(titleHintTimer);
            }

            function mostrarAyudaInfoTitulo(duration) {
                var hint = document.getElementById('info-title-hint');
                if (!hint) return;
                hint.classList.add('is-visible');
                if (titleHintTimer) window.clearTimeout(titleHintTimer);
                titleHintTimer = window.setTimeout(ocultarAyudaInfoTitulo, duration || 9000);
            }

            function inicializarInfoTitulo() {
                var button = document.getElementById('btn-info-title');
                var anexos = document.getElementById('anexos-detalle');
                if (button) {
                    button.addEventListener('click', function() {
                        mostrarInfoTitulo(50000);
                    });
                }
                if (anexos) {
                    anexos.addEventListener('toggle', function() {
                        if (anexos.open) {
                            mostrarInfoTitulo(90000);
                        } else {
                            mostrarInfoTitulo(50000);
                        }
                    });
                }
                mostrarInfoTitulo(30000, { mantenerAyuda: true });
                mostrarAyudaInfoTitulo(40000);
            }

        // =========================================================
        // PROTECCIÃ“N DE INTERACCIÃ“N: Bloqueo de Clic Derecho y Arrastre
        // =========================================================
        var mapViewport = document.getElementById('map');
        mapViewport.addEventListener('contextmenu', function(e) {
            e.preventDefault(); 
        });
        mapViewport.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });

        // =========================================================
        // 1. SISTEMA PRE-CACHÃ‰, LIMPIEZA Y SEGURIDAD
        // =========================================================
        function esURLSegura(url) {
            try {
                var parsed = new URL(url);
                return parsed.protocol === 'https:' || parsed.protocol === 'http:';
            } catch (e) {
                return false;
            }
        }

        function fixMojibake(text) {
            if (!text) return '-';
            let t = String(text);
            t = t.replace(/Ãƒâ€˜/g, 'Ã‘').replace(/ÃƒÂ±/g, 'Ã±').replace(/Ãƒ /g, 'Ã').replace(/ÃƒÂ¡/g, 'Ã¡')
                 .replace(/Ãƒâ€°/g, 'Ã‰').replace(/ÃƒÂ©/g, 'Ã©').replace(/Ãƒ /g, 'Ã').replace(/ÃƒÂ­/g, 'Ã­')
                 .replace(/Ãƒâ€œ/g, 'Ã“').replace(/ÃƒÂ³/g, 'Ã³').replace(/ÃƒÅ¡/g, 'Ãš').replace(/ÃƒÂº/g, 'Ãº')
                 .replace(/\uFFFD/g, 'Ã±');
            t = t.replace(/Aviaci.n/i, 'Aviación').replace(/Jir.n/i, 'Jirón')
                 .replace(/Sim.n/i, 'Simón').replace(/Le.n/i, 'León').replace(/Garc.a/i, 'García')
                 .replace(/SECCI.N/i, 'SECCIÓN').replace(/Ordo.ez/i, 'Ordoñez').replace(/Pe.a/i, 'Peña')
                 .replace(/Ãƒ/g, 'í'); 
            return t.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
        }

        function quitarTildes(texto) { 
            return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; 
        }

        function getProp(obj) {
            if (!obj) return undefined;
            for (var i = 1; i < arguments.length; i++) {
                var key = arguments[i];
                if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null) {
                    return obj[key];
                }
            }
            return undefined;
        }

        function getPropFlexible(obj) {
            if (!obj) return undefined;
            var expected = [];
            for (var i = 1; i < arguments.length; i++) {
                expected.push(normalizarTextoPlano(arguments[i]));
            }
            var exact = getProp.apply(null, arguments);
            if (exact != null) return exact;
            var keys = Object.keys(obj);
            for (var k = 0; k < keys.length; k++) {
                if (expected.includes(normalizarTextoPlano(keys[k])) && obj[keys[k]] != null) {
                    return obj[keys[k]];
                }
            }
            return undefined;
        }

        function normalizarTextoPlano(texto) {
            return quitarTildes(fixMojibake(texto || '').replace(/&lt;|&gt;/g, ''));
        }

        function obtenerNombreVia(props) {
            if (!props) return "";
            return props._fixedName || props.NOMBRE_FIN || props.NOMBRECOMP || props.NOMBRE || "";
        }

        function esPanamericanaSur(props) {
            var nombre = normalizarTextoPlano(obtenerNombreVia(props));
            return nombre.includes('panamericana sur');
        }

        function obtenerTipoMetropolitano(props) {
            if (!props) return "";
            var clas = normalizarTextoPlano(props.CLASIFIC || props.CLASIFICA || props.clasifica || '');
            var subc = normalizarTextoPlano(getProp(props, 'SUBCLASIFI', 'SUBCLASIFICACI\u00d3N') || '');
            var nivel = normalizarTextoPlano(props.NIVEL || '');
            var competencia = normalizarTextoPlano(props.COMPETENCI || props.COMPETENCIA || '');

            if (esPanamericanaSur(props)) return 'expresa';
            if (nivel.includes('expresa') || subc.includes('expresa')) return 'expresa';
            if (nivel.includes('arterial') || subc.includes('arterial')) return 'arterial';
            if (nivel.includes('colectora') || subc.includes('colectora')) return 'colectora';

            if (clas.includes('metropolitana') || competencia.includes('metropolitana') ||
                nivel.includes('metropolitana') || subc.includes('metropolitana') ||
                nivel === 'arteriales' || nivel === 'colectoras' || nivel === 'expresas') {
                return 'colectora';
            }

            return "";
        }

        function etiquetaTipoMetropolitano(tipo) {
            if (tipo === 'expresa') return 'Expresa';
            if (tipo === 'arterial') return 'Arterial';
            if (tipo === 'colectora') return 'Colectora';
            return '';
        }

        function createTextStyle(feature, resolution, labelText, labelFont, labelFill, placement, bufferColor, bufferWidth) {
            if (!labelText) return null;
            return new ol.style.Text({
                text: labelText,
                font: labelFont,
                placement: placement || 'point',
                fill: new ol.style.Fill({ color: labelFill || '#000000' }),
                stroke: new ol.style.Stroke({
                    color: bufferColor || '#ffffff',
                    width: bufferWidth || 0
                }),
                overflow: true
            });
        }

        function normalizarNucleoVia(nombre) {
            if (!nombre) return "";
            var n = quitarTildes(nombre).toUpperCase();
            n = n.replace(/^(AV\.|AVENIDA|JR\.|JIRON|JIRON|CA\.|CALLE|PSJ\.|PASAJE|ALAMEDA|AL\.)\s+/i, '');
            return n.trim();
        }

        function preprocesarGeoJSON(layerData) {
            if (layerData && layerData.features) {
                layerData.features.forEach(f => {
                    if (!f.properties) f.properties = {};
                    if (!f.properties._fixedName) {
                        var nomBruto = f.properties.hasOwnProperty('NOMBRE_FIN') ? f.properties.NOMBRE_FIN : 
                                      (f.properties.hasOwnProperty('NOMBRECOMP') ? f.properties.NOMBRECOMP : 
                                      (f.properties.hasOwnProperty('NOMBRE') ? f.properties.NOMBRE : ""));
                        var n = fixMojibake(nomBruto);
                        f.properties._fixedName = n;
                        f.properties._normalizedName = normalizarNucleoVia(n);
                    }
                });
            }
        }

        var datosLimite = typeof json_limite_distrital_0 !== 'undefined' ? json_limite_distrital_0 : null;
        var datosLocales = typeof json_red_vial_0 !== 'undefined' ? json_red_vial_0 :
            (typeof json_red_vial_1 !== 'undefined' ? json_red_vial_1 :
            (typeof json_red_vial_2 !== 'undefined' ? json_red_vial_2 : null));
        var datosSecciones = typeof json_Secciones_Viales_3_1 !== 'undefined' ? json_Secciones_Viales_3_1 :
            (typeof json_Secciones_Viales_3_0 !== 'undefined' ? json_Secciones_Viales_3_0 :
            (typeof json_Secciones_Viales_2 !== 'undefined' ? json_Secciones_Viales_2 :
            (typeof json_Secciones_Viales_3 !== 'undefined' ? json_Secciones_Viales_3 : null)));
        var datosSubsectores = typeof json_subsectores_1 !== 'undefined' ? json_subsectores_1 : null;
        var datosSectores = typeof json_Sectores_2 !== 'undefined' ? json_Sectores_2 : null;
        var datosTorresSanBorja = typeof json_PlantasdeAlamedasypasajes_2 !== 'undefined' ? json_PlantasdeAlamedasypasajes_2 :
            (typeof json_PlantasdeAlamedasypasajes_1 !== 'undefined' ? json_PlantasdeAlamedasypasajes_1 :
            (typeof json_EPIOFICIAL_0 !== 'undefined' ? json_EPIOFICIAL_0 : null));
        var datosLotesTorresSanBorja = typeof json_Lotes_0 !== 'undefined' ? json_Lotes_0 : null;
        var datosEpiTorresSanBorja = typeof json_EPI_TorresdeSanBorja_2 !== 'undefined' ? json_EPI_TorresdeSanBorja_2 : null;
        var datosAlamedasSubmanzanas = typeof json_ALAMEDASDESUBMANZANAS_3 !== 'undefined' ? json_ALAMEDASDESUBMANZANAS_3 : null;
        var datosPlantasLimatambo = typeof json_PlantasdevasenLimatambo_0 !== 'undefined' ? json_PlantasdevasenLimatambo_0 : null;
        var datosManzanasLimatambo = typeof json_Manzanas_Limatambo_1 !== 'undefined' ? json_Manzanas_Limatambo_1 : null;
        var datosLotesLimatambo = typeof json_Lotes_Limatambo_2 !== 'undefined' ? json_Lotes_Limatambo_2 : null;
        var datosAreasTechadasLimatambo = typeof json_reastechadas_3 !== 'undefined' ? json_reastechadas_3 : null;

        preprocesarGeoJSON(datosLimite);
        preprocesarGeoJSON(datosLocales); 
        preprocesarGeoJSON(datosSecciones);
        preprocesarGeoJSON(datosSubsectores);
        preprocesarGeoJSON(datosSectores);
        preprocesarGeoJSON(datosTorresSanBorja);
        preprocesarGeoJSON(datosLotesTorresSanBorja);
        preprocesarGeoJSON(datosEpiTorresSanBorja);
        preprocesarGeoJSON(datosAlamedasSubmanzanas);
        preprocesarGeoJSON(datosPlantasLimatambo);
        preprocesarGeoJSON(datosManzanasLimatambo);
        preprocesarGeoJSON(datosLotesLimatambo);
        preprocesarGeoJSON(datosAreasTechadasLimatambo);
