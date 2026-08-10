var size = 0;
var placement = 'point';
var fillPattern_BORDEDESUBMANZANAYREALIBRE_7 = null;

function getFillPattern_BORDEDESUBMANZANAYREALIBRE_7() {
    if (fillPattern_BORDEDESUBMANZANAYREALIBRE_7) return fillPattern_BORDEDESUBMANZANAYREALIBRE_7;
    var canvas = document.createElement('canvas');
    canvas.width = 36;
    canvas.height = 36;
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'rgba(245,245,245,0.95)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'square';
    ctx.beginPath();
    for (var i = -36; i <= 72; i += 18) {
        ctx.moveTo(i, 36);
        ctx.lineTo(i + 36, 0);
    }
    ctx.stroke();

    fillPattern_BORDEDESUBMANZANAYREALIBRE_7 = ctx.createPattern(canvas, 'repeat');
    return fillPattern_BORDEDESUBMANZANAYREALIBRE_7;
}

var style_BORDEDESUBMANZANAYREALIBRE_7 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    
    var labelText = ""; 
    var value = feature.get("");
    var labelFont = "10px, sans-serif";
    var labelFill = "#D9D9D9";
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
        stroke: new ol.style.Stroke({color: 'rgba(217, 217, 217)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 2}),fill: new ol.style.Fill({color: getFillPattern_BORDEDESUBMANZANAYREALIBRE_7()}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];

    return style;
};
