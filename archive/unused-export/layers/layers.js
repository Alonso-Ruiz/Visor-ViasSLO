var wms_layers = [];

var format_limite_distrital_0 = new ol.format.GeoJSON();
var features_limite_distrital_0 = format_limite_distrital_0.readFeatures(json_limite_distrital_0, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_limite_distrital_0 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_limite_distrital_0.addFeatures(features_limite_distrital_0);
var lyr_limite_distrital_0 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_limite_distrital_0, 
                style: style_limite_distrital_0,
                popuplayertitle: 'limite_distrital',
                interactive: false,
                title: '<img src="styles/legend/limite_distrital_0.png" /> limite_distrital'
            });
var format_jerarqua_vial_1 = new ol.format.GeoJSON();
var features_jerarqua_vial_1 = format_jerarqua_vial_1.readFeatures(json_jerarqua_vial_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_jerarqua_vial_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_jerarqua_vial_1.addFeatures(features_jerarqua_vial_1);
var lyr_jerarqua_vial_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_jerarqua_vial_1, 
                style: style_jerarqua_vial_1,
                popuplayertitle: 'jerarquía_vial',
                interactive: true,
    title: 'jerarquía_vial<br />\
    <img src="styles/legend/jerarqua_vial_1_0.png" /> VÍAS METROPOLITANAS<br />' });
var format_red_vial_2 = new ol.format.GeoJSON();
var features_red_vial_2 = format_red_vial_2.readFeatures(json_red_vial_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_red_vial_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_red_vial_2.addFeatures(features_red_vial_2);
var lyr_red_vial_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_red_vial_2, 
                style: style_red_vial_2,
                popuplayertitle: 'red_vial',
                interactive: true,
    title: 'red_vial<br />\
    <img src="styles/legend/red_vial_2_0.png" /> Vía Local Preferencial<br />\
    <img src="styles/legend/red_vial_2_1.png" /> Vía Local Secundaria<br />' });
var format_Secciones_Viales_3 = new ol.format.GeoJSON();
var features_Secciones_Viales_3 = format_Secciones_Viales_3.readFeatures(json_Secciones_Viales_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Secciones_Viales_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Secciones_Viales_3.addFeatures(features_Secciones_Viales_3);
var lyr_Secciones_Viales_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Secciones_Viales_3, 
                style: style_Secciones_Viales_3,
                popuplayertitle: 'Secciones_Viales',
                interactive: false,
                title: '<img src="styles/legend/Secciones_Viales_3.png" /> Secciones_Viales'
            });
var group_mapapdf = new ol.layer.Group({
                                layers: [lyr_jerarqua_vial_1,lyr_red_vial_2,],
                                fold: 'open',
                                title: 'mapa pdf'});
var group_Contexto = new ol.layer.Group({
                                layers: [lyr_limite_distrital_0,],
                                fold: 'open',
                                title: 'Contexto'});

lyr_limite_distrital_0.setVisible(true);lyr_jerarqua_vial_1.setVisible(true);lyr_red_vial_2.setVisible(true);lyr_Secciones_Viales_3.setVisible(true);
var layersList = [group_Contexto,group_mapapdf,lyr_Secciones_Viales_3];
lyr_limite_distrital_0.set('fieldAliases', {'OBJECTID': 'OBJECTID', 'AREA_M2': 'AREA_M2', });
lyr_jerarqua_vial_1.set('fieldAliases', {'OBJECTID': 'OBJECTID', 'NOMBRECOMP': 'NOMBRECOMP', 'NIVEL': 'NIVEL', 'LONGITUD': 'LONGITUD', });
lyr_red_vial_2.set('fieldAliases', {'TIPOVIA': 'TIPOVIA', 'COMPETENCI': 'COMPETENCI', 'NOMBRE_FIN': 'NOMBRE_FIN', 'SUBCLASIFI': 'SUBCLASIFI', 'CATEGORÍA': 'CATEGORÍA', 'CLASIFIC': 'CLASIFIC', 'TRAMO': 'TRAMO', 'CÓDIGO': 'CÓDIGO', 'ANCHO': 'ANCHO', 'LINK': 'LINK', });
lyr_Secciones_Viales_3.set('fieldAliases', {'CODIGO': 'CODIGO', 'TRAMO': 'TRAMO', 'NOMBRE': 'NOMBRE', 'CLASIFICA': 'CLASIFICA', 'CÓDIGO_AN': 'CÓDIGO_AN', 'ANCHO': 'ANCHO', 'LINK': 'LINK', 'ANCHO_VAR': 'ANCHO_VAR', });
lyr_limite_distrital_0.set('fieldImages', {'OBJECTID': 'TextEdit', 'AREA_M2': '', });
lyr_jerarqua_vial_1.set('fieldImages', {'OBJECTID': 'TextEdit', 'NOMBRECOMP': 'TextEdit', 'NIVEL': 'TextEdit', 'LONGITUD': 'TextEdit', });
lyr_red_vial_2.set('fieldImages', {'TIPOVIA': '', 'COMPETENCI': '', 'NOMBRE_FIN': 'TextEdit', 'SUBCLASIFI': 'UniqueValues', 'CATEGORÍA': 'TextEdit', 'CLASIFIC': 'TextEdit', 'TRAMO': 'TextEdit', 'CÓDIGO': 'TextEdit', 'ANCHO': 'TextEdit', 'LINK': 'TextEdit', });
lyr_Secciones_Viales_3.set('fieldImages', {'CODIGO': 'TextEdit', 'TRAMO': 'TextEdit', 'NOMBRE': 'TextEdit', 'CLASIFICA': 'TextEdit', 'CÓDIGO_AN': 'TextEdit', 'ANCHO': 'TextEdit', 'LINK': 'TextEdit', 'ANCHO_VAR': 'TextEdit', });
lyr_limite_distrital_0.set('fieldLabels', {'OBJECTID': 'no label', 'AREA_M2': 'no label', });
lyr_jerarqua_vial_1.set('fieldLabels', {'OBJECTID': 'hidden field', 'NOMBRECOMP': 'header label - visible with data', 'NIVEL': 'header label - visible with data', 'LONGITUD': 'hidden field', });
lyr_red_vial_2.set('fieldLabels', {'TIPOVIA': 'hidden field', 'COMPETENCI': 'hidden field', 'NOMBRE_FIN': 'header label - visible with data', 'SUBCLASIFI': 'header label - visible with data', 'CATEGORÍA': 'header label - visible with data', 'CLASIFIC': 'header label - visible with data', 'TRAMO': 'header label - visible with data', 'CÓDIGO': 'header label - visible with data', 'ANCHO': 'header label - visible with data', 'LINK': 'header label - visible with data', });
lyr_Secciones_Viales_3.set('fieldLabels', {'CODIGO': 'no label', 'TRAMO': 'no label', 'NOMBRE': 'no label', 'CLASIFICA': 'no label', 'CÓDIGO_AN': 'no label', 'ANCHO': 'no label', 'LINK': 'no label', 'ANCHO_VAR': 'no label', });
lyr_Secciones_Viales_3.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});