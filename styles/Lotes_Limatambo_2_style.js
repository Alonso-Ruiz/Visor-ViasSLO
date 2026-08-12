var size = 0;
var placement = 'point';
var fillPattern_Lotes_Limatambo_2 = null;

function getFillPattern_Lotes_Limatambo_2() {
    if (fillPattern_Lotes_Limatambo_2) return fillPattern_Lotes_Limatambo_2;
    var canvas = document.createElement('canvas');
    canvas.width = 36;
    canvas.height = 36;
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'rgba(245,245,245,0.95)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.beginPath();
    for (var i = -36; i <= 72; i += 18) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 36, 36);
    }
    ctx.stroke();

    fillPattern_Lotes_Limatambo_2 = ctx.createPattern(canvas, 'repeat');
    return fillPattern_Lotes_Limatambo_2;
}

var style_Lotes_Limatambo_2 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    
    var labelText = ""; 
    var value = feature.get("");
    var labelFont = "10px, sans-serif";
    var labelFill = "#ebebebf2";
    var bufferColor = "";
    var bufferWidth = 0;
    var textAlign = "left";
    var offsetX = 0;
    var offsetY = 0;
    var placement = 'point';
    if ("" !== null) {
        labelText = String("");
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(235,235,235,0.95)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 1.40}),fill: new ol.style.Fill({color: getFillPattern_Lotes_Limatambo_2()}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};
