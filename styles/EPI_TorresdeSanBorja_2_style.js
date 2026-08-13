var size = 0;
var placement = 'point';
var fillPattern_EPI_TorresdeSanBorja_2 = null;

function getFillPattern_EPI_TorresdeSanBorja_2() {
    if (fillPattern_EPI_TorresdeSanBorja_2) return fillPattern_EPI_TorresdeSanBorja_2;
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

    fillPattern_EPI_TorresdeSanBorja_2 = ctx.createPattern(canvas, 'repeat');
    return fillPattern_EPI_TorresdeSanBorja_2;
}

var style_EPI_TorresdeSanBorja_2 = function(feature, resolution){
    var labelText = "";
    var labelFont = "10px, sans-serif";
    var labelFill = "#000000";
    var bufferColor = "";
    var bufferWidth = 0;

    return [new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(235,235,235,0.95)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 1.25}),
        fill: new ol.style.Fill({color: getFillPattern_EPI_TorresdeSanBorja_2()}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
};
