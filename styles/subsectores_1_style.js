var size = 0;
var placement = 'point';

var style_subsectores_1 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    
    var labelText = ""; 
    var value = feature.get("");
    var labelFont = "13.0px \'Arial Black\', sans-serif";
    var labelFill = "#ffffff";
    var bufferColor = "#05009a";
    var bufferWidth = 3.0;
    var textAlign = "left";
    var offsetX = 0;
    var offsetY = 0;
    var placement = 'point';
    if (feature.get("RefName") !== null) {
        labelText = String(feature.get("RefName"));
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(229,229,229,1.0)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 1.9}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};

var style_subsectores_1_label = function(feature, resolution){
    var labelText = "";
    if (feature.get("RefName") !== null) {
        labelText = String(feature.get("RefName"));
    }

    return [new ol.style.Style({
        text: createTextStyle(feature, resolution, labelText, "13.0px 'Arial Black', sans-serif",
                              "#ffffff", "point", "#05009a", 4.0)
    })];
};
