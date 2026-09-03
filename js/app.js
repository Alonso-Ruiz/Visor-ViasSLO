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
