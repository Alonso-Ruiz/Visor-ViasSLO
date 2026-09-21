function inicializarEventosInterfaz() {
    var cerrarPortadaBtn = document.getElementById('btn-cerrar-portada');
    var ingresarBtn = document.getElementById('btn-ingresar-visor');

    if (cerrarPortadaBtn) cerrarPortadaBtn.addEventListener('click', cerrarPortada);
    if (ingresarBtn) ingresarBtn.addEventListener('click', cerrarPortada);

    document.querySelectorAll('[data-toggle-checkbox]').forEach(function(el) {
        el.addEventListener('click', function() {
            var checkbox = document.getElementById(el.getAttribute('data-toggle-checkbox'));
            if (checkbox) checkbox.click();
        });
    });

    document.querySelectorAll('[data-toggle-def]').forEach(function(el) {
        el.addEventListener('click', function() {
            toggleDef(el.getAttribute('data-toggle-def'));
        });
    });

    function setAnexosOpen(open) {
        var anexos = document.getElementById('anexos-detalle');
        var mobile = esVistaMovil();
        document.body.classList.toggle('mobile-anexos-open', open && mobile);
        document.body.classList.toggle('desktop-anexos-open', open && !mobile);
        if (open) {
            if (typeof window.cancelarStreetView === 'function') window.cancelarStreetView();
            mostrarInfoTitulo(0);
            if (anexos) anexos.open = true;
        } else {
            if (anexos) anexos.open = false;
            ocultarInfoTitulo({ forzar: true, mostrarAyuda: false });
        }
    }

    // Punto único para que cualquier acceso móvil use el diseño moderno de anexos.
    window.setAnexosOpen = setAnexosOpen;

    var mobileAnexos = document.getElementById('mobile-anexos');
    var desktopAnexos = document.getElementById('desktop-anexos');
    var cerrarMobileAnexos = document.getElementById('btn-cerrar-anexos-mobile');
    if (mobileAnexos) {
        mobileAnexos.addEventListener('click', function() {
            setAnexosOpen(!document.body.classList.contains('mobile-anexos-open'));
        });
    }
    if (desktopAnexos) desktopAnexos.addEventListener('click', function() {
        setAnexosOpen(!document.body.classList.contains('desktop-anexos-open'));
    });
    if (cerrarMobileAnexos) cerrarMobileAnexos.addEventListener('click', function() { setAnexosOpen(false); });
}

function iniciarAplicacion() {
    inicializarEventosInterfaz();
    inicializarInfoTitulo();
    actualizarVisibilidadCapas();

    if (window.__visorBootstrap) {
        window.__visorBootstrap.appReady = true;
        if (typeof window.__visorBootstrap.releaseEarlyHandlers === 'function') {
            window.__visorBootstrap.releaseEarlyHandlers();
        }
        if (window.__visorBootstrap.userRequestedEntry) {
            usuarioSolicitoEntrar = true;
            cerrarPortada();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarAplicacion);
} else {
    iniciarAplicacion();
}
