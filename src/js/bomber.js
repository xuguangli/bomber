/**
 * Created by guangli on 2016/6/13.
 */
window.onload = function(){
    function drawImage(context, image, x, y) {
        context.drawImage(image, y, x);

    }

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.fillStyle = "#EEEEFF";
    context.fillRect(0, 0, 640, 480);

    var jsondata = $.ajax({
        url: "/init",
        async: false
    }).responseText;
    var data = JSON.parse(jsondata);
    //console.log(jsondata)
    for (var row = 0; row < data.length; row++) {
        var oneRow = data[row];
        for (var column = 0; column < oneRow.length; column++) {
            if (oneRow[column] == 2) {
                drawImage(context, wall, row * 16, column * 16, 16, 16);
            } else if (oneRow[column] == 1) {
                drawImage(context, brick, row * 16, column * 16, 16, 16);
            }
            //else if (oneRow[column] == 3) {
            //    drawImage(context, red, row * 16, column * 16, 16, 16);
            //}
        }
    }
}