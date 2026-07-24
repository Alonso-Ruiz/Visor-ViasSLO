var wms_layers = [];

var format_red_vial_0 = new ol.format.GeoJSON();
var features_red_vial_0 = format_red_vial_0.readFeatures(json_red_vial_0, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_red_vial_0 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_red_vial_0.addFeatures(features_red_vial_0);
var lyr_red_vial_0 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_red_vial_0, 
                style: style_red_vial_0,
                popuplayertitle: 'red_vial',
                interactive: true,
    title: 'red_vial<br />\
    <img src="styles/legend/red_vial_0_0.png" /> Vía Local Preferencial<br />\
    <img src="styles/legend/red_vial_0_1.png" /> Vía Local Secundaria<br />\
    <img src="styles/legend/red_vial_0_2.png" /> Metropolitana<br />' });
var format_Secciones_Viales_3_1 = new ol.format.GeoJSON();
var features_Secciones_Viales_3_1 = format_Secciones_Viales_3_1.readFeatures(json_Secciones_Viales_3_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Secciones_Viales_3_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Secciones_Viales_3_1.addFeatures(features_Secciones_Viales_3_1);
var lyr_Secciones_Viales_3_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Secciones_Viales_3_1, 
                style: style_Secciones_Viales_3_1,
                popuplayertitle: 'Secciones_Viales_3',
                interactive: true,
                title: '<img src="styles/legend/Secciones_Viales_3_1.png" /> Secciones_Viales_3'
            });
var format_PlantasdeAlamedasypasajes_2 = new ol.format.GeoJSON();
var features_PlantasdeAlamedasypasajes_2 = format_PlantasdeAlamedasypasajes_2.readFeatures(json_PlantasdeAlamedasypasajes_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_PlantasdeAlamedasypasajes_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_PlantasdeAlamedasypasajes_2.addFeatures(features_PlantasdeAlamedasypasajes_2);
var lyr_PlantasdeAlamedasypasajes_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_PlantasdeAlamedasypasajes_2, 
                style: style_PlantasdeAlamedasypasajes_2,
                popuplayertitle: 'Plantas de Alamedas y pasajes',
                interactive: true,
    title: 'Plantas de Alamedas y pasajes<br />\
    <img src="styles/legend/PlantasdeAlamedasypasajes_2_0.png" /> Alameda<br />\
    <img src="styles/legend/PlantasdeAlamedasypasajes_2_1.png" /> Pasaje<br />\
    <img src="styles/legend/PlantasdeAlamedasypasajes_2_2.png" /> Servidumbre de Paso<br />' });
var format_ALAMEDASDESUBMANZANAS_3 = new ol.format.GeoJSON();
var features_ALAMEDASDESUBMANZANAS_3 = format_ALAMEDASDESUBMANZANAS_3.readFeatures(json_ALAMEDASDESUBMANZANAS_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_ALAMEDASDESUBMANZANAS_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_ALAMEDASDESUBMANZANAS_3.addFeatures(features_ALAMEDASDESUBMANZANAS_3);
var lyr_ALAMEDASDESUBMANZANAS_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_ALAMEDASDESUBMANZANAS_3, 
                style: style_ALAMEDASDESUBMANZANAS_3,
                popuplayertitle: 'ALAMEDAS DE SUBMANZANAS',
                interactive: true,
                title: '<img src="styles/legend/ALAMEDASDESUBMANZANAS_3.png" /> ALAMEDAS DE SUBMANZANAS'
            });

lyr_red_vial_0.setVisible(true);lyr_Secciones_Viales_3_1.setVisible(true);lyr_PlantasdeAlamedasypasajes_2.setVisible(true);lyr_ALAMEDASDESUBMANZANAS_3.setVisible(true);
var layersList = [lyr_red_vial_0,lyr_Secciones_Viales_3_1,lyr_PlantasdeAlamedasypasajes_2,lyr_ALAMEDASDESUBMANZANAS_3];
lyr_red_vial_0.set('fieldAliases', {'COMPETENCI': 'COMPETENCI', 'NOMBRE_FIN': 'NOMBRE_FIN', 'SUBCLASIFI': 'SUBCLASIFI', 'CATEGORÍA': 'CATEGORÍA', 'CLASIFIC': 'CLASIFIC', 'TRAMO': 'TRAMO', 'CÓDIGO': 'CÓDIGO', 'ANCHO': 'ANCHO', 'LINK': 'LINK', 'LINKVERCEL': 'LINKVERCEL', });
lyr_Secciones_Viales_3_1.set('fieldAliases', {'CODIGO': 'CODIGO', 'TRAMO': 'TRAMO', 'NOMBRE': 'NOMBRE', 'CLASIFICA': 'CLASIFICA', 'CÓDIGO_AN': 'CÓDIGO_AN', 'ANCHO': 'ANCHO', 'LINK': 'LINK', 'FRANJAS': 'FRANJAS', 'LINKVERCEL': 'LINKVERCEL', });
lyr_PlantasdeAlamedasypasajes_2.set('fieldAliases', {'Tipo': 'Tipo', 'AREA': 'AREA', 'CLASIFICAC': 'CLASIFICAC', 'SUBCLASIFI': 'SUBCLASIFI', 'CATEGORÍA': 'CATEGORÍA', 'NOMBRE': 'NOMBRE', 'CÓDIGO': 'CÓDIGO', 'LINK': 'LINK', 'LINKVERCEL': 'LINKVERCEL', });
lyr_ALAMEDASDESUBMANZANAS_3.set('fieldAliases', {'CLASIFICAC': 'CLASIFICAC', 'SUBCLASIFI': 'SUBCLASIFI', 'CATEGORÍA': 'CATEGORÍA', 'NOMBRE_1': 'NOMBRE_1', 'CÓDIGO': 'CÓDIGO', 'LINK': 'LINK', 'LINKVERCEL': 'LINKVERCEL', });
lyr_red_vial_0.set('fieldImages', {'COMPETENCI': 'TextEdit', 'NOMBRE_FIN': 'TextEdit', 'SUBCLASIFI': 'UniqueValues', 'CATEGORÍA': 'TextEdit', 'CLASIFIC': 'TextEdit', 'TRAMO': 'TextEdit', 'CÓDIGO': 'TextEdit', 'ANCHO': 'TextEdit', 'LINK': 'TextEdit', 'LINKVERCEL': '', });
lyr_Secciones_Viales_3_1.set('fieldImages', {'CODIGO': 'TextEdit', 'TRAMO': 'TextEdit', 'NOMBRE': 'TextEdit', 'CLASIFICA': 'TextEdit', 'CÓDIGO_AN': 'TextEdit', 'ANCHO': 'TextEdit', 'LINK': 'TextEdit', 'FRANJAS': 'TextEdit', 'LINKVERCEL': 'TextEdit', });
lyr_PlantasdeAlamedasypasajes_2.set('fieldImages', {'Tipo': 'TextEdit', 'AREA': 'TextEdit', 'CLASIFICAC': 'TextEdit', 'SUBCLASIFI': 'TextEdit', 'CATEGORÍA': 'TextEdit', 'NOMBRE': 'TextEdit', 'CÓDIGO': 'TextEdit', 'LINK': 'TextEdit', 'LINKVERCEL': 'TextEdit', });
lyr_ALAMEDASDESUBMANZANAS_3.set('fieldImages', {'CLASIFICAC': '', 'SUBCLASIFI': '', 'CATEGORÍA': '', 'NOMBRE_1': '', 'CÓDIGO': '', 'LINK': '', 'LINKVERCEL': '', });
lyr_red_vial_0.set('fieldLabels', {'COMPETENCI': 'no label', 'NOMBRE_FIN': 'no label', 'SUBCLASIFI': 'no label', 'CATEGORÍA': 'no label', 'CLASIFIC': 'no label', 'TRAMO': 'no label', 'CÓDIGO': 'no label', 'ANCHO': 'no label', 'LINK': 'no label', 'LINKVERCEL': 'no label', });
lyr_Secciones_Viales_3_1.set('fieldLabels', {'CODIGO': 'no label', 'TRAMO': 'no label', 'NOMBRE': 'no label', 'CLASIFICA': 'no label', 'CÓDIGO_AN': 'no label', 'ANCHO': 'no label', 'LINK': 'no label', 'FRANJAS': 'no label', 'LINKVERCEL': 'no label', });
lyr_PlantasdeAlamedasypasajes_2.set('fieldLabels', {'Tipo': 'no label', 'AREA': 'no label', 'CLASIFICAC': 'no label', 'SUBCLASIFI': 'no label', 'CATEGORÍA': 'no label', 'NOMBRE': 'no label', 'CÓDIGO': 'no label', 'LINK': 'no label', 'LINKVERCEL': 'no label', });
lyr_ALAMEDASDESUBMANZANAS_3.set('fieldLabels', {'CLASIFICAC': 'no label', 'SUBCLASIFI': 'no label', 'CATEGORÍA': 'no label', 'NOMBRE_1': 'no label', 'CÓDIGO': 'no label', 'LINK': 'no label', 'LINKVERCEL': 'no label', });
lyr_ALAMEDASDESUBMANZANAS_3.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});