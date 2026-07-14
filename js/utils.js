function cerrarPortada() {
                var modal = document.getElementById('welcome-modal');
                if(modal) { modal.style.opacity = '0'; setTimeout(function() { modal.style.display = 'none'; }, 400); }
                mostrarInfoTitulo(4200);
            }
            function toggleDef(id) {
                var el = document.getElementById(id);
                if (el) el.classList.toggle('active');
            }

            var titleInfoTimer = null;

            function ocultarInfoTitulo() {
                var title = document.getElementById('title-container');
                if (title) title.classList.add('title-hidden');
            }

            function mostrarInfoTitulo(duration) {
                var title = document.getElementById('title-container');
                if (!title) return;
                title.classList.remove('title-hidden');
                if (titleInfoTimer) window.clearTimeout(titleInfoTimer);
                if (duration) {
                    titleInfoTimer = window.setTimeout(ocultarInfoTitulo, duration);
                }
            }

            function inicializarInfoTitulo() {
                var button = document.getElementById('btn-info-title');
                if (button) {
                    button.addEventListener('click', function() {
                        mostrarInfoTitulo(6500);
                    });
                }
                mostrarInfoTitulo(5200);
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
        var datosLocales = typeof json_red_vial_1 !== 'undefined' ? json_red_vial_1 : (typeof json_red_vial_2 !== 'undefined' ? json_red_vial_2 : null);
        var datosSecciones = typeof json_Secciones_Viales_2 !== 'undefined' ? json_Secciones_Viales_2 : (typeof json_Secciones_Viales_3 !== 'undefined' ? json_Secciones_Viales_3 : null);

        preprocesarGeoJSON(datosLimite);
        preprocesarGeoJSON(datosLocales); 
        preprocesarGeoJSON(datosSecciones);
