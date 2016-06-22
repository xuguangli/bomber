/**
 * Created by guangli on 2016/6/13.
 */
var row = 30,//地图默认行数
    column = 80,//地图默认列数
    default_block_width = 16,//默认贴图宽度
    default_block_height = 16,//默认贴图高度
    data,//地图数据
    canvas, //画布
    context,//画布容器上下文
    pomelo = window.pomelo,
    gateHost = "127.0.0.1",//gate服务器地址，主要负责负载均衡，为客户端分配connector服务器
    getePort = "3010",
    KEY_W = 87,
    KEY_S = 83,
    KEY_A = 65,
    KEY_D = 68,
    KEY_SPACE = 32,
    SPEED = 1,//角色行走的速度
    ROAD = 0,
    actor,
    router = "gate.gateHandler.queryEntry";

var LOGIN_ERROR = "连接服务器异常";
var drawImage = function (image, x, y) {
    context.drawImage(image, x, y);
};
//画矩形
var drawRect = function (x, y, width, height) {
    context.fillRect(x, y, width, height)
}
var drawMap = function (data, callback) {
    for (var row = 0; row < data.length; row++) {
        var oneRow = data[row];
        for (var column = 0; column < oneRow.length; column++) {
            if (oneRow[column] == 2) {
                drawImage(wall, column * default_block_width, row * default_block_height, 16, 16);
            } else if (oneRow[column] == 1) {
                drawImage(brick, column * default_block_width, row * default_block_height, 16, 16);
            }
            //else if (oneRow[column] == 3) {
            //    drawImage(context, red, row * 16, column * 16, 16, 16);
            //}
        }
    }
}
/**
 * 获取可用的xy坐标
 * @param x
 * @param y
 * @returns {*}
 */
var getXY = function (x, y) {
    if (x == undefined) {
        x = parseInt(Math.random() * column);
    }
    if (y == undefined) {
        y = parseInt(Math.random() * row);
    }
    var r = data[y];
    //console.log(x, y);
    if (r[x] == ROAD) {
        return {
            'x': x,
            'y': y
        }
    } else {
        return getXY();
    }
}

var addRole = function (role, x, y) {
    var p = getXY(x, y)
    actor = new Role(role, default_block_height * p.x, default_block_width * p.y);
    //console.log("rx,ry : " + default_block_height * p.x, default_block_width * p.y);
    drawImage(actor.image, actor.x, actor.y);
}
var collision = function (gx, gy) {
    //console.log("GX,GY : " + gx, gy);
    var x, y;
    x = parseInt(gx / default_block_width);
    y = parseInt(gy / default_block_height)
    var r = data[y];
    //console.log(x, y);
    console.log("value : " + r[x]);
    if (r[x] != ROAD) {
        return true;
    } else {
        return false;
    }
}
var roleMove = function (code) {
    var flag = true;
    if (code == KEY_W) {//上移
        if (!collision(actor.x, actor.y - SPEED)) {
            drawRect(actor.x, actor.y + actor.height - SPEED, actor.width, SPEED);
            actor.y = actor.y - SPEED;
        } else {
            flag = false;
        }
    } else if (code == KEY_S) {//下移
        if (!collision(actor.x, actor.y + SPEED + default_block_height - 1)) {
            drawRect(actor.x, actor.y, actor.width, SPEED);
            actor.y = actor.y + SPEED;
        } else {
            flag = false;
        }
    } else if (code == KEY_A) {//左移
        if (!collision(actor.x - SPEED, actor.y)) {
            drawRect(actor.x + actor.width - SPEED, actor.y, SPEED, actor.height);
            actor.x = actor.x - SPEED;
        } else {
            flag = false;
        }
    } else if (code == KEY_D) {//右移
        if (!collision(actor.x + SPEED + default_block_width - 1, actor.y)) {
            drawRect(actor.x, actor.y, SPEED, actor.height);
            actor.x = actor.x + SPEED;
        } else {
            flag = false;
        }
    } else if (code == KEY_SPACE) {//空格

    }
    if (flag) {
        drawImage(actor.image, actor.x, actor.y);
    }
}

var doKeyDown = function (e) {
    var keyID = e.keyCode ? e.keyCode : e.which;
    roleMove(keyID);
}

//添加事件监听
var addEventListener = function () {
    //添加键盘事件
    $(document).keydown(doKeyDown);
}


window.onload = function () {
    //TODO 获取设备类型，屏幕大小，计算合适的地图行数和列数
    canvas = document.getElementById('canvas');

    canvas.width = column * default_block_width;
    canvas.height = row * default_block_height;

    context = canvas.getContext('2d');
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
    }, function () {
        pomelo.request(router, {
            uid: 'guangli' //用户ID，先写死
        }, function (conn) {
            pomelo.disconnect();//关闭访问路由服务器的连接
            if (conn.code === 500) {
                showError(LOGIN_ERROR);
                return;
            }
            pomelo.init({
                host: conn.host,
                port: conn.port,
                log: true
            }, function () {
                //TODO:将初始化地图与connector分开，connector只维护连接相关逻辑
                pomelo.request("connector.entryHandler1.initMap", param, function (map_data) {
                    data = JSON.parse(map_data.msg);
                    drawMap(data);
                    addEventListener();
                    addRole(role);
                });
            });
        });
    });
};