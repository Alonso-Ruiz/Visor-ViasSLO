(function() {
    var button = document.getElementById('btn-streetview');
    var ghost = document.getElementById('streetview-drag-ghost');
    var mapEl = document.getElementById('map');
    var targeting = false;
    var dragging = false;
    var startPixel = null;
    var wasTargetingBeforeDrag = false;
    var activePointerId = null;

    if (!button || !mapEl || typeof map === 'undefined' || typeof ol === 'undefined') return;

    function setTargeting(active) {
        targeting = active;
        button.classList.toggle('is-active', active);
        document.body.classList.toggle('streetview-targeting', active);
        if (!active) clearStreetViewHighlight();
    }

    function updateGhost(clientX, clientY) {
        if (!ghost) return;
        ghost.style.left = clientX + 'px';
        ghost.style.top = clientY + 'px';
        ghost.classList.add('is-visible');
    }

    function hideGhost() {
        if (ghost) ghost.classList.remove('is-visible');
    }

    function cancelStreetViewMode() {
        dragging = false;
        activePointerId = null;
        setTargeting(false);
        hideGhost();
        clearStreetViewHighlight();
    }

    function isVisualOnlyLayer(layer) {
        return layer === layerLimite ||
            layer === layerHighlight ||
            layer === layerSectores ||
            layer === layerSubsectores ||
            layer === layerSectoresLabels ||
            layer === layerSubsectoresLabels ||
            layer === layerSecciones ||
            layer === layerJuanXXIIISubmanzana ||
            layer === layerJuanXXIIISubmanzanaPoligono ||
            layer === layerJuanXXIIIAreasLibresSubmanzana ||
            layer === layerTorresLotes ||
            layer === layerTorresEpi ||
            layer === layerLimatamboLotes ||
            layer === layerLimatamboAreasTechadas;
    }

    function getStreetViewFeatureAtPixel(pixel) {
        if (!pixel) return null;
        return map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            if (isVisualOnlyLayer(layer)) return null;
            return feature;
        }, { hitTolerance: 12 });
    }

    function isInsideSanBorja(coordinate) {
        if (!coordinate || typeof layerLimite === 'undefined') return false;
        var features = layerLimite.getSource().getFeatures();
        for (var i = 0; i < features.length; i++) {
            var geometry = features[i].getGeometry();
            if (geometry && typeof geometry.intersectsCoordinate === 'function' && geometry.intersectsCoordinate(coordinate)) {
                return true;
            }
            if (geometry && ol.extent.containsCoordinate(geometry.getExtent(), coordinate)) {
                return true;
            }
        }
        return false;
    }

    function highlightFeatureAtPixel(pixel) {
        if (!pixel || typeof sourceHighlight === 'undefined') return null;
        var selected = getStreetViewFeatureAtPixel(pixel);

        sourceHighlight.clear();
        if (selected) sourceHighlight.addFeature(selected);
        return selected;
    }

    function clearStreetViewHighlight() {
        if (typeof sourceHighlight !== 'undefined') sourceHighlight.clear();
    }

    function getCoordinateFromClient(clientX, clientY) {
        var rect = mapEl.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            return null;
        }
        return map.getCoordinateFromPixel([clientX - rect.left, clientY - rect.top]);
    }

    function calculateHeading(start, end) {
        if (!start || !end) return 0;
        var dx = end[0] - start[0];
        var dy = start[1] - end[1];
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return 0;
        return Math.round((Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360);
    }

    function openStreetView(coordinate, heading, pixel) {
        if (!coordinate) {
            cancelStreetViewMode();
            return;
        }
        if (!isInsideSanBorja(coordinate)) {
            cancelStreetViewMode();
            return;
        }
        if (!getStreetViewFeatureAtPixel(pixel)) {
            cancelStreetViewMode();
            return;
        }
        var lonLat = ol.proj.toLonLat(coordinate);
        var lng = lonLat[0].toFixed(7);
        var lat = lonLat[1].toFixed(7);
        var url = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' +
            lat + ',' + lng +
            '&heading=' + (heading || 0) +
            '&pitch=10&fov=250';
        window.open(url, '_blank', 'noopener,noreferrer');
        setTargeting(false);
        hideGhost();
        clearStreetViewHighlight();
    }

    function beginStreetViewDrag(evt) {
        if (dragging) return;
        if (evt.pointerType === 'mouse' && evt.button !== 0) return;
        dragging = true;
        activePointerId = evt.pointerId;
        startPixel = [evt.clientX, evt.clientY];
        wasTargetingBeforeDrag = targeting;
        setTargeting(true);
        updateGhost(evt.clientX, evt.clientY);
        if (button.setPointerCapture) {
            try {
                button.setPointerCapture(evt.pointerId);
            } catch (error) {}
        }
        evt.preventDefault();
        evt.stopPropagation();
    }

    function moveStreetViewDrag(evt) {
        if (!dragging) return;
        if (activePointerId !== null && evt.pointerId !== activePointerId) return;
        updateGhost(evt.clientX, evt.clientY);
        var rect = mapEl.getBoundingClientRect();
        highlightFeatureAtPixel([evt.clientX - rect.left, evt.clientY - rect.top]);
        evt.preventDefault();
    }

    function endStreetViewDrag(evt) {
        if (!dragging) return;
        if (activePointerId !== null && evt.pointerId !== activePointerId) return;
        dragging = false;
        activePointerId = null;
        if (button.releasePointerCapture) {
            try {
                button.releasePointerCapture(evt.pointerId);
            } catch (error) {}
        }
        var moved = Math.hypot(evt.clientX - startPixel[0], evt.clientY - startPixel[1]) > 8;
        var coordinate = getCoordinateFromClient(evt.clientX, evt.clientY);
        var rect = mapEl.getBoundingClientRect();
        var pixel = [evt.clientX - rect.left, evt.clientY - rect.top];
        var heading = calculateHeading(startPixel, [evt.clientX, evt.clientY]);
        if (moved && coordinate) {
            openStreetView(coordinate, heading, pixel);
        } else if (!moved) {
            setTargeting(!wasTargetingBeforeDrag);
            hideGhost();
        } else {
            cancelStreetViewMode();
        }
        evt.preventDefault();
    }

    button.addEventListener('pointerdown', beginStreetViewDrag);
    document.addEventListener('pointermove', moveStreetViewDrag, { passive: false });
    document.addEventListener('pointerup', endStreetViewDrag, { passive: false });
    document.addEventListener('pointercancel', function(evt) {
        if (activePointerId !== null && evt.pointerId !== activePointerId) return;
        cancelStreetViewMode();
    });

    map.on('pointermove', function(evt) {
        if (!targeting || dragging) return;
        highlightFeatureAtPixel(evt.pixel);
    });

    map.on('singleclick', function(evt) {
        if (!targeting || dragging) return;
        openStreetView(evt.coordinate, 0, evt.pixel);
    });

    document.addEventListener('keydown', function(evt) {
        if (evt.key === 'Escape' && targeting) {
            setTargeting(false);
            hideGhost();
            clearStreetViewHighlight();
        }
    });
})();
