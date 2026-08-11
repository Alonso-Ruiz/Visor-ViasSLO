        var map = new ol.Map({
            target: 'map',
            renderer: ['webgl', 'canvas'],
            layers: [googleSat, layerSectores, layerSubsectores, layerJuanXXIIISubmanzanaPoligono, layerJuanXXIIIAreasLibresSubmanzana, layerLimatamboAreasTechadas, layerLimatamboLotes, layerLimatamboSubmanzana, layerTorresAlameda, layerTorresPasaje, layerTorresServidumbre, layerLimatamboAlameda, layerLimatamboCalle, layerLimatamboJiron, layerLimatamboPasaje, layerLimatamboServidumbre, layerJuanXXIIISubmanzana, layerJuanXXIIIAlameda, layerSecciones, layerSecVehicular, layerSecRestringido, layerSecPasaje, layerSecAlameda, layerPref, layerMetroColectora, layerMetroArterial, layerMetroExpresa, layerSectoresLabels, layerSubsectoresLabels, layerHighlight, layerLimite],
            view: new ol.View({ center: ol.proj.fromLonLat([-76.9933, -12.0951]), zoom: 14, minZoom: 13, maxZoom: 22 }),
            controls: [new ol.control.ScaleLine()]
        });

        map.addControl(new ol.control.Zoom());

        var northArrowEl = document.createElement('div');
        northArrowEl.className = 'north-arrow-ctrl ol-unselectable ol-control';
        northArrowEl.title = 'Orientar al Norte';
        var compassIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        compassIcon.setAttribute('id', 'compass-icon');
        compassIcon.setAttribute('viewBox', '0 0 24 24');
        var compassPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        compassPath.setAttribute('d', 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z');
        compassIcon.appendChild(compassPath);
        northArrowEl.appendChild(compassIcon);
        northArrowEl.onclick = function() {
            map.getView().animate({ rotation: 0, duration: 350 });
        };
        map.addControl(new ol.control.Control({ element: northArrowEl }));

        map.getView().on('change:rotation', function() {
            var rotation = map.getView().getRotation();
            document.getElementById('compass-icon').style.transform = 'rotate(' + rotation + 'rad)';
        });



        map.on('singleclick', function(evt) {
            var clickedLayer = null;
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(f, l) {
                if (l === layerLimite || l === layerHighlight || l === layerSecciones || l === layerJuanXXIIISubmanzana || l === layerJuanXXIIISubmanzanaPoligono || l === layerJuanXXIIIAreasLibresSubmanzana || l === layerLimatamboLotes || l === layerLimatamboAreasTechadas) return null;
                clickedLayer = l;
                return f;
            }, { hitTolerance: 10 }); 
            
            if (feature && (clickedLayer === layerSectores || clickedLayer === layerSectoresLabels)) {
                mostrarPopupSector(feature, evt.coordinate, 'sector');
            } else if (feature && (clickedLayer === layerSubsectores || clickedLayer === layerSubsectoresLabels)) {
                mostrarPopupSector(feature, evt.coordinate, 'subsector');
            } else if (feature && [layerTorresAlameda, layerTorresPasaje, layerTorresServidumbre, layerJuanXXIIIAlameda, layerLimatamboAlameda, layerLimatamboCalle, layerLimatamboJiron, layerLimatamboPasaje, layerLimatamboServidumbre, layerLimatamboSubmanzana].includes(clickedLayer)) {
                mostrarPopupTorres(feature, evt.coordinate);
            } else if (feature) {
                mostrarPopupFeature(feature, evt.coordinate);
            } 
            else { overlay.setPosition(undefined); sourceHighlight.clear(); }
        });


        // =========================================================
        // MEJORA UX: CAMBIO DE CURSOR AL PASAR SOBRE UNA VÍA (HOVER)
        // =========================================================
        map.on('pointermove', function(evt) {
            if (evt.dragging) return;

            var hit = map.forEachFeatureAtPixel(evt.pixel, function(f, l) {
                return (l !== layerLimite && l !== layerHighlight && l !== layerSecciones && l !== layerJuanXXIIISubmanzana && l !== layerJuanXXIIISubmanzanaPoligono && l !== layerJuanXXIIIAreasLibresSubmanzana && l !== layerLimatamboLotes && l !== layerLimatamboAreasTechadas) ? true : false;
            }, { hitTolerance: 10 });

            var viewport = map.getViewport();
            if (hit) {
                viewport.classList.add('is-hovering');
            } else {
                viewport.classList.remove('is-hovering');
            }
        });


        // =========================================================
        // INTERACCIONES AVANZADAS: ZOOM (SHIFT) Y SELECCIÓN (CLICK DERECHO)
        // =========================================================
        const esMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        
        if (!esMobile) {
            var dragZoom = new ol.interaction.DragZoom({
                condition: ol.events.condition.shiftKeyOnly
            });
            map.addInteraction(dragZoom);

            var dragBox = new ol.interaction.DragBox({
                condition: function(mapBrowserEvent) {
                    return mapBrowserEvent.originalEvent.button === 2; 
                }
            });

            map.addInteraction(dragBox);

            dragBox.on('boxend', function() {
                var extent = dragBox.getGeometry().getExtent();
                var selectedFeatures = [];
                var layersToSelect = [layerMetroArterial, layerMetroColectora, layerMetroExpresa, layerPref, layerSecVehicular, layerSecRestringido, layerSecPasaje, layerSecAlameda];

                layersToSelect.forEach(function(layer) {
                    if(layer.getVisible()) {
                        layer.getSource().forEachFeatureIntersectingExtent(extent, function(feature) {
                            selectedFeatures.push(feature);
                        });
                    }
                });

                if (selectedFeatures.length > 0) {
                    var boxCenter = ol.extent.getCenter(extent);
                    mostrarPopupFeature(selectedFeatures[0], boxCenter, selectedFeatures); 
                }
            });

            dragBox.on('boxstart', function() {
                sourceHighlight.clear();
                overlay.setPosition(undefined);
            });
        }

        // =========================================================
        // 5. CHECKBOXES, GRUPOS SINCRONIZADOS Y VISIBILIDAD POR ESCALA
        // =========================================================
        var chkMetroMaster = document.getElementById('chk-metro');
        var subsMetro = ['chk-metro-art', 'chk-metro-col', 'chk-metro-exp'];

        chkMetroMaster.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            subsMetro.forEach(id => {
                var el = document.getElementById(id);
                if (el) el.checked = isChecked;
            });
            actualizarVisibilidadCapas();
        });

        function updateMasterMetroState() {
            var allChecked = subsMetro.every(id => document.getElementById(id).checked);
            var anyChecked = subsMetro.some(id => document.getElementById(id).checked);
            chkMetroMaster.checked = allChecked;
            chkMetroMaster.indeterminate = !allChecked && anyChecked;
        }

        subsMetro.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                updateMasterMetroState();
                actualizarVisibilidadCapas();
            });
        });

        var chkSecMaster = document.getElementById('chk-sec');
        var subsSec = ['chk-sec-veh', 'chk-sec-res', 'chk-sec-pas', 'chk-sec-ala'];

        chkSecMaster.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            subsSec.forEach(id => {
                var el = document.getElementById(id);
                if (el) el.checked = isChecked;
            });
            actualizarVisibilidadCapas();
        });

        function updateMasterSecState() {
            var allChecked = subsSec.every(id => document.getElementById(id).checked);
            var anyChecked = subsSec.some(id => document.getElementById(id).checked);
            chkSecMaster.checked = allChecked;
            chkSecMaster.indeterminate = !allChecked && anyChecked; 
        }

        subsSec.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                updateMasterSecState();
                actualizarVisibilidadCapas();
            });
        });

        document.getElementById('chk-sec-res').addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            document.getElementById('chk-sec-pas').checked = isChecked;
            document.getElementById('chk-sec-ala').checked = isChecked;
            updateMasterSecState();
            actualizarVisibilidadCapas();
        });

        var chkSectorMaster = document.getElementById('chk-sector');
        var subsSector = ['chk-sector-pol', 'chk-subsector'];

        chkSectorMaster.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            subsSector.forEach(id => {
                var el = document.getElementById(id);
                if (el) el.checked = isChecked;
            });
            actualizarVisibilidadCapas();
        });

        function updateMasterSectorState() {
            var allChecked = subsSector.every(id => document.getElementById(id).checked);
            var anyChecked = subsSector.some(id => document.getElementById(id).checked);
            chkSectorMaster.checked = allChecked;
            chkSectorMaster.indeterminate = !allChecked && anyChecked;
        }

        subsSector.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                updateMasterSectorState();
                actualizarVisibilidadCapas();
            });
        });

        var chkTorresMaster = document.getElementById('chk-torres');
        var subsTorres = ['chk-torres-alameda', 'chk-torres-pasaje', 'chk-torres-servidumbre'];

        chkTorresMaster.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            subsTorres.forEach(id => {
                var el = document.getElementById(id);
                if (el) el.checked = isChecked;
            });
            actualizarVisibilidadCapas();
        });

        function updateMasterTorresState() {
            var allChecked = subsTorres.every(id => document.getElementById(id).checked);
            var anyChecked = subsTorres.some(id => document.getElementById(id).checked);
            chkTorresMaster.checked = allChecked;
            chkTorresMaster.indeterminate = !allChecked && anyChecked;
        }

        subsTorres.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                updateMasterTorresState();
                actualizarVisibilidadCapas();
            });
        });

        var chkJuanXXIIIMaster = document.getElementById('chk-juan-xxiii');
        var subsJuanXXIII = ['chk-juan-xxiii-alameda', 'chk-juan-xxiii-submanzana'];

        chkJuanXXIIIMaster.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            subsJuanXXIII.forEach(id => {
                var el = document.getElementById(id);
                if (el) el.checked = isChecked;
            });
            actualizarVisibilidadCapas();
        });

        function updateMasterJuanXXIIIState() {
            var allChecked = subsJuanXXIII.every(id => document.getElementById(id).checked);
            var anyChecked = subsJuanXXIII.some(id => document.getElementById(id).checked);
            chkJuanXXIIIMaster.checked = allChecked;
            chkJuanXXIIIMaster.indeterminate = !allChecked && anyChecked;
        }

        subsJuanXXIII.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                updateMasterJuanXXIIIState();
                actualizarVisibilidadCapas();
            });
        });

        var chkLimatamboMaster = document.getElementById('chk-limatambo');
        var subsLimatambo = ['chk-limatambo-alameda', 'chk-limatambo-calle', 'chk-limatambo-jiron', 'chk-limatambo-pasaje', 'chk-limatambo-servidumbre', 'chk-limatambo-submanzana'];

        chkLimatamboMaster.addEventListener('change', function(e) {
            var isChecked = e.target.checked;
            subsLimatambo.forEach(id => {
                var el = document.getElementById(id);
                if (el) el.checked = isChecked;
            });
            actualizarVisibilidadCapas();
        });

        function updateMasterLimatamboState() {
            var allChecked = subsLimatambo.every(id => document.getElementById(id).checked);
            var anyChecked = subsLimatambo.some(id => document.getElementById(id).checked);
            chkLimatamboMaster.checked = allChecked;
            chkLimatamboMaster.indeterminate = !allChecked && anyChecked;
        }

        subsLimatambo.forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                updateMasterLimatamboState();
                actualizarVisibilidadCapas();
            });
        });

        function actualizarVisibilidadCapas() {
            var z = map.getView().getZoom();
            
            var chkLimite = document.getElementById('chk-limite'); 
            var chkMetroArt = document.getElementById('chk-metro-art');
            var chkMetroCol = document.getElementById('chk-metro-col');
            var chkMetroExp = document.getElementById('chk-metro-exp');
            var chkPref = document.getElementById('chk-pref');
            var chkSecVeh = document.getElementById('chk-sec-veh');
            var chkSecRes = document.getElementById('chk-sec-res');
            var chkSecPas = document.getElementById('chk-sec-pas');
            var chkSecAla = document.getElementById('chk-sec-ala');
            var chkSecciones = document.getElementById('chk-secciones');
            var chkSectorPol = document.getElementById('chk-sector-pol');
            var chkSubsector = document.getElementById('chk-subsector');
            var chkTorresAlameda = document.getElementById('chk-torres-alameda');
            var chkTorresPasaje = document.getElementById('chk-torres-pasaje');
            var chkTorresServidumbre = document.getElementById('chk-torres-servidumbre');
            var chkJuanXXIIIAlameda = document.getElementById('chk-juan-xxiii-alameda');
            var chkJuanXXIIISubmanzana = document.getElementById('chk-juan-xxiii-submanzana');
            var chkLimatamboAlameda = document.getElementById('chk-limatambo-alameda');
            var chkLimatamboCalle = document.getElementById('chk-limatambo-calle');
            var chkLimatamboJiron = document.getElementById('chk-limatambo-jiron');
            var chkLimatamboPasaje = document.getElementById('chk-limatambo-pasaje');
            var chkLimatamboServidumbre = document.getElementById('chk-limatambo-servidumbre');
            var chkLimatamboSubmanzana = document.getElementById('chk-limatambo-submanzana');

            layerLimite.setVisible(chkLimite && chkLimite.checked);
            layerSectores.setVisible(chkSectorPol && chkSectorPol.checked && z >= 13);
            layerSubsectores.setVisible(chkSubsector && chkSubsector.checked && z >= 14);
            layerSectoresLabels.setVisible(chkSectorPol && chkSectorPol.checked && z >= 13);
            layerSubsectoresLabels.setVisible(chkSubsector && chkSubsector.checked && z >= 14);
            layerTorresAlameda.setVisible(chkTorresAlameda && chkTorresAlameda.checked && z >= 13);
            layerTorresPasaje.setVisible(chkTorresPasaje && chkTorresPasaje.checked && z >= 13);
            layerTorresServidumbre.setVisible(chkTorresServidumbre && chkTorresServidumbre.checked && z >= 13);
            layerJuanXXIIIAlameda.setVisible(chkJuanXXIIIAlameda && chkJuanXXIIIAlameda.checked && z >= 13);
            layerJuanXXIIISubmanzana.setVisible(chkJuanXXIIISubmanzana && chkJuanXXIIISubmanzana.checked && z >= 13);
            layerJuanXXIIISubmanzanaPoligono.setVisible(chkJuanXXIIISubmanzana && chkJuanXXIIISubmanzana.checked && z >= 13);
            layerJuanXXIIIAreasLibresSubmanzana.setVisible(chkJuanXXIIISubmanzana && chkJuanXXIIISubmanzana.checked && z >= 13);
            layerLimatamboAlameda.setVisible(chkLimatamboAlameda && chkLimatamboAlameda.checked && z >= 13);
            layerLimatamboCalle.setVisible(chkLimatamboCalle && chkLimatamboCalle.checked && z >= 13);
            layerLimatamboJiron.setVisible(chkLimatamboJiron && chkLimatamboJiron.checked && z >= 13);
            layerLimatamboPasaje.setVisible(chkLimatamboPasaje && chkLimatamboPasaje.checked && z >= 13);
            layerLimatamboServidumbre.setVisible(chkLimatamboServidumbre && chkLimatamboServidumbre.checked && z >= 13);
            layerLimatamboSubmanzana.setVisible(chkLimatamboSubmanzana && chkLimatamboSubmanzana.checked && z >= 13);
            layerLimatamboLotes.setVisible(chkLimatamboSubmanzana && chkLimatamboSubmanzana.checked && z >= 13);
            layerLimatamboAreasTechadas.setVisible(chkLimatamboSubmanzana && chkLimatamboSubmanzana.checked && z >= 13);
            layerMetroArterial.setVisible(chkMetroArt && chkMetroArt.checked && z >= 13);
            layerMetroColectora.setVisible(chkMetroCol && chkMetroCol.checked && z >= 13);
            layerMetroExpresa.setVisible(chkMetroExp && chkMetroExp.checked && z >= 13);
            
            var showLocales = z >= 13;
            layerPref.setVisible(chkPref && chkPref.checked && showLocales);
            layerSecVehicular.setVisible(chkSecVeh && chkSecVeh.checked && showLocales);
            layerSecRestringido.setVisible(chkSecRes && chkSecRes.checked && showLocales);
            layerSecPasaje.setVisible(chkSecPas && chkSecPas.checked && showLocales);
            layerSecAlameda.setVisible(chkSecAla && chkSecAla.checked && showLocales);
            
            layerSecciones.setVisible(chkSecciones && chkSecciones.checked && z >= 16);
        }
        
        map.getView().on('change:resolution', actualizarVisibilidadCapas);
        
        ['chk-pref', 'chk-secciones', 'chk-limite'].forEach(id => {
            var el = document.getElementById(id);
            if (el) el.addEventListener('change', actualizarVisibilidadCapas);
        });

        document.getElementById('sat-opacity').addEventListener('input', function(e) { googleSat.setOpacity(parseFloat(e.target.value)); });
        
        var panel = document.getElementById('panel-usos');
        var btnAbrirPanel = document.getElementById('btn-abrir-panel');
        var btnCerrarPanel = document.getElementById('btn-cerrar-panel');

        btnCerrarPanel.addEventListener('click', function() { 
            panel.classList.add('oculto'); 
            btnAbrirPanel.style.display = 'flex'; 
        });
        
        btnAbrirPanel.addEventListener('click', function() { 
            panel.classList.remove('oculto'); 
            this.style.display = 'none'; 
        });

        if (window.innerWidth <= 896) {
            panel.classList.add('oculto');
            btnAbrirPanel.style.display = 'flex';
        } else {
            panel.classList.remove('oculto');
            btnAbrirPanel.style.display = 'none';
        }

