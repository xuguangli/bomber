/**
 * Created by guangli on 2016/6/13.
 */

var drawImage = function (context, image, x, y) {
    context.drawImage(image, y, x);

};
window.onload = function () {
    var row = 30,//地图默认行数
        column = 80,//地图默认列数
        default_block_width = 16,//默认贴图宽度
        default_block_height = 16;//默认贴图高度
        pomelo = window.pomelo,
        host = "127.0.0.1",
        port = "3010";

    //TODO 获取设备类型，屏幕大小，计算合适的地图行数和列数
    var canvas = document.getElementById('canvas');

    canvas.width = column * default_block_width;
    canvas.height = row * default_block_height;

    var context = canvas.getContext('2d');
    context.fillStyle = "#EEEEFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var param = {
        'row': row,
        'column': column
    };
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function() {
        pomelo.request("connector.entryHandler.initMap", param, function(map_data) {
            var data = JSON.parse(map_data.msg);
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
        });
    });
};