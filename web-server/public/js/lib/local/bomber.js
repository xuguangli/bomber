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
        gateHost = "127.0.0.1",//gate服务器地址，主要负责负载均衡，为客户端分配connector服务器
        getePort = "3010",
        router = "gate.gateHandler.queryEntry";
    var LOGIN_ERROR = "连接服务器异常";

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

    //访问路由服务器，如果访问成功，返回connector服务器的ip和端口
    pomelo.init({
        host: gateHost,
        port: getePort,
        log: true
    }, function() {
        pomelo.request(router, {
            uid:'guangli' //用户ID，先写死
        }, function(conn) {
            pomelo.disconnect();//关闭访问路由服务器的连接
            if(conn.code === 500) {
                showError(LOGIN_ERROR);
                return;
            }
            pomelo.init({
                host:conn.host,
                port: conn.port,
                log: true
            }, function() {
                pomelo.request("connector.entryHandler1.initMap", param, function(map_data) {
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
        });
    });
};