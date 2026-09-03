(function() {
    var estado = window.__visorBootstrap = {
        appReady: false,
        mapReady: false,
        userRequestedEntry: false,
        releaseEarlyHandlers: null
    };

    var botonEntrar = document.getElementById('btn-ingresar-visor');
    var botonCerrar = document.getElementById('btn-cerrar-portada');
    var modal = document.getElementById('welcome-modal');

    function mostrarPreparando() {
        if (estado.appReady) return;
        estado.userRequestedEntry = true;
        if (modal) modal.setAttribute('aria-busy', 'true');
        if (botonEntrar) {
            botonEntrar.textContent = 'Preparando visor…';
            botonEntrar.classList.add('is-preparing');
        }
    }

    if (botonEntrar) botonEntrar.addEventListener('click', mostrarPreparando);
    if (botonCerrar) botonCerrar.addEventListener('click', mostrarPreparando);

    estado.releaseEarlyHandlers = function() {
        if (botonEntrar) botonEntrar.removeEventListener('click', mostrarPreparando);
        if (botonCerrar) botonCerrar.removeEventListener('click', mostrarPreparando);
    };

    var scripts = [
        'vendor/openlayers/ol.js',
        'layers/limite_distrital_0.js',
        'layers/red_vial_0.js?v=20260903-terre-tilde-labels',
        'layers/Secciones_Viales_3_1.js?v=20260903-terre-tilde-labels',
        'layers/subsectores_1.js',
        'layers/Sectores_2.js',
        'layers/PlantasdeAlamedasypasajes_2.js?v=20260813-torres-poligonos',
        'layers/Lotes_0.js?v=20260813-torres-poligonos',
        'layers/EPI_TorresdeSanBorja_2.js?v=20260813-torres-poligonos',
        'layers/ALAMEDASDESUBMANZANAS_3.js',
        'layers/BORDEDESUBMANZANAYREALIBRE_7.js',
        'layers/SUBMANZANAS_1.js',
        'layers/AREASLIBRESDESUBMANZANAS_0.js',
        'layers/PlantasdevasenLimatambo_0.js?v=20260811-limatambo-submanzanas',
        'layers/Manzanas_Limatambo_1.js?v=20260811-limatambo-submanzanas',
        'layers/Lotes_Limatambo_2.js?v=20260811-limatambo-submanzanas',
        'layers/reastechadas_3.js?v=20260811-limatambo-submanzanas',
        'js/pdf-manifest.js?v=20260903-terre-tilde-labels',
        'js/utils.js?v=20260903-bootstrap',
        'styles/subsectores_1_style.js',
        'styles/Sectores_2_style.js',
        'styles/PlantasdeAlamedasypasajes_2_style.js',
        'styles/Lotes_0_style.js?v=20260813-torres-poligonos',
        'styles/EPI_TorresdeSanBorja_2_style.js?v=20260813-torres-poligonos',
        'styles/ALAMEDASDESUBMANZANAS_3_style.js',
        'styles/BORDEDESUBMANZANAYREALIBRE_7_style.js',
        'styles/SUBMANZANAS_1_style.js',
        'styles/AREASLIBRESDESUBMANZANAS_0_style.js',
        'styles/PlantasdevasenLimatambo_0_style.js?v=20260811-limatambo-submanzanas',
        'styles/Manzanas_Limatambo_1_style.js?v=20260811-limatambo-submanzanas',
        'styles/Lotes_Limatambo_2_style.js?v=20260811-lotes-rayado',
        'styles/reastechadas_3_style.js?v=20260811-limatambo-submanzanas',
        'js/layers.js?v=20260903-performance',
        'js/map.js?v=20260903-performance',
        'js/streetview.js?v=20260902-mobile-drag',
        'js/popup.js?v=20260903-concejo-bosque',
        'js/search.js?v=20260903-performance',
        'js/app.js?v=20260903-bootstrap'
    ];

    function informarErrorCarga() {
        if (modal) modal.setAttribute('aria-busy', 'false');
        if (botonEntrar) {
            botonEntrar.textContent = 'No se pudo cargar el visor';
            botonEntrar.classList.remove('is-preparing');
            botonEntrar.disabled = true;
        }
    }

    function cargarAplicacion() {
        scripts.forEach(function(src) {
            var script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.onerror = informarErrorCarga;
            document.body.appendChild(script);
        });
    }

    requestAnimationFrame(function() {
        requestAnimationFrame(cargarAplicacion);
    });
})();
