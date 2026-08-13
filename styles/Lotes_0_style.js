var size = 0;
var placement = 'point';
var fillPattern_Lotes_0 = null;

function getFillPattern_Lotes_0() {
    if (fillPattern_Lotes_0) return fillPattern_Lotes_0;
    var canvas = document.createElement('canvas');
    canvas.width = 36;
    canvas.height = 36;
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'rgba(245,245,245,0.95)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    ctx.beginPath();
    for (var i = -36; i <= 72; i += 18) {
        ctx.moveTo(i, 36);
        ctx.lineTo(i + 36, 0);
    }
    ctx.stroke();

    fillPattern_Lotes_0 = ctx.createPattern(canvas, 'repeat');
    return fillPattern_Lotes_0;
}

var style_Lotes_0 = function(feature, resolution){
    var labelText = "";
    var labelFont = "10px, sans-serif";
    var labelFill = "#000000";
    var bufferColor = "";
    var bufferWidth = 0;

    return [new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(247,247,247,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        fill: new ol.style.Fill({color: getFillPattern_Lotes_0()}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
};
