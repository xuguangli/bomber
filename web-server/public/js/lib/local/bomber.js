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
    BRICK = 1,
    WALL = 2,
    BOMB = 3,
    BOMB_FUSE = 2200,
    EXPLOSION_DURATION = 350,
    BOMB_RANGE = 3,
    MAX_ACTIVE_BOMBS = 3,
    BACKGROUND_COLOR = "#EEEEFF",
    wallImage,
    brickImage,
    roleImage,
    actor,
    bombs = [],
    gameOver = false,
    router = "gate.gateHandler.queryEntry";

var LOGIN_ERROR = "连接服务器异常";
var drawImage = function (image, x, y, width, height) {
    if (width !== undefined && height !== undefined) {
        context.drawImage(image, x, y, width, height);
    } else {
        context.drawImage(image, x, y);
    }
};
//画矩形
var drawRect = function (x, y, width, height) {
    context.save();
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(x, y, width, height);
    context.restore();
}

var drawBombTile = function (tileX, tileY) {
    context.save();
    context.fillStyle = "#222";
    var px = tileX * default_block_width;
    var py = tileY * default_block_height;
    var centerX = px + default_block_width / 2;
    var centerY = py + default_block_height / 2;
    var radius = Math.min(default_block_width, default_block_height) / 2 - 2;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    context.fill();
    context.restore();
}

var redrawTile = function (tileX, tileY) {
    context.save();
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(tileX * default_block_width, tileY * default_block_height, default_block_width, default_block_height);
    context.restore();
    var value = data[tileY][tileX];
    if (value === WALL) {
        drawImage(wallImage, tileX * default_block_width, tileY * default_block_height, default_block_width, default_block_height);
    } else if (value === BRICK) {
        drawImage(brickImage, tileX * default_block_width, tileY * default_block_height, default_block_width, default_block_height);
    } else if (value === BOMB) {
        drawBombTile(tileX, tileY);
    }
}

var drawMap = function (data, callback) {
    for (var rowIndex = 0; rowIndex < data.length; rowIndex++) {
        var oneRow = data[rowIndex];
        for (var columnIndex = 0; columnIndex < oneRow.length; columnIndex++) {
            redrawTile(columnIndex, rowIndex);
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

var addRole = function (x, y) {
    var p = getXY(x, y)
    actor = new Role(roleImage, default_block_height * p.x, default_block_width * p.y);
    //console.log("rx,ry : " + default_block_height * p.x, default_block_width * p.y);
    drawImage(actor.image, actor.x, actor.y);
}
var collision = function (gx, gy) {
    var x = parseInt(gx / default_block_width);
    var y = parseInt(gy / default_block_height);
    if (y < 0 || y >= data.length || x < 0 || x >= data[y].length) {
        return true;
    }
    var r = data[y];
    var value = r[x];
    if (value === ROAD) {
        return false;
    }
    if (value === BOMB && actor) {
        var actorTile = getActorTile();
        if (actorTile && actorTile.x === x && actorTile.y === y) {
            return false;
        }
    }
    return true;
}

var getActorTile = function () {
    if (!actor) {
        return null;
    }
    return {
        x: Math.floor((actor.x + actor.width / 2) / default_block_width),
        y: Math.floor((actor.y + actor.height / 2) / default_block_height)
    };
}

var placeBomb = function () {
    if (gameOver || !actor || !data) {
        return;
    }
    if (bombs.length >= MAX_ACTIVE_BOMBS) {
        return;
    }
    var tile = getActorTile();
    if (!tile) {
        return;
    }
    if (tile.y < 0 || tile.y >= data.length || tile.x < 0 || tile.x >= data[tile.y].length) {
        return;
    }
    if (data[tile.y][tile.x] !== ROAD) {
        return;
    }
    var bomb = {
        x: tile.x,
        y: tile.y,
        exploded: false
    };
    bombs.push(bomb);
    data[tile.y][tile.x] = BOMB;
    redrawTile(tile.x, tile.y);
    bomb.timeout = setTimeout(function () {
        explodeBomb(bomb);
    }, BOMB_FUSE);
}

var getExplosionTiles = function (originX, originY) {
    var tiles = [{x: originX, y: originY}];
    var directions = [
        {dx: 1, dy: 0},
        {dx: -1, dy: 0},
        {dx: 0, dy: 1},
        {dx: 0, dy: -1}
    ];
    for (var i = 0; i < directions.length; i++) {
        var dir = directions[i];
        for (var step = 1; step <= BOMB_RANGE; step++) {
            var x = originX + dir.dx * step;
            var y = originY + dir.dy * step;
            if (y < 0 || y >= data.length || x < 0 || x >= data[y].length) {
                break;
            }
            var tileValue = data[y][x];
            if (tileValue === WALL) {
                break;
            }
            tiles.push({x: x, y: y});
            if (tileValue === BRICK) {
                break;
            }
        }
    }
    return tiles;
}

var drawExplosion = function (tiles) {
    context.save();
    context.fillStyle = "#f5b041";
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        context.fillRect(tile.x * default_block_width, tile.y * default_block_height, default_block_width, default_block_height);
    }
    context.restore();
}

var renderGameOver = function () {
    context.save();
    context.fillStyle = "rgba(0,0,0,0.6)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "48px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    context.restore();
}

var killActor = function () {
    if (gameOver) {
        return;
    }
    gameOver = true;
    $(document).off('keydown', doKeyDown);
}

var checkActorHit = function (tiles) {
    if (!actor || gameOver) {
        return;
    }
    var actorRect = {
        left: actor.x,
        right: actor.x + actor.width,
        top: actor.y,
        bottom: actor.y + actor.height
    };
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        var left = tile.x * default_block_width;
        var top = tile.y * default_block_height;
        var right = left + default_block_width;
        var bottom = top + default_block_height;
        if (!(actorRect.left >= right || actorRect.right <= left || actorRect.top >= bottom || actorRect.bottom <= top)) {
            killActor();
            break;
        }
    }
}

var explodeBomb = function (bomb) {
    if (!bomb || bomb.exploded) {
        return;
    }
    bomb.exploded = true;
    var index = bombs.indexOf(bomb);
    if (index !== -1) {
        bombs.splice(index, 1);
    }
    data[bomb.y][bomb.x] = ROAD;
    var tiles = getExplosionTiles(bomb.x, bomb.y);
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        if (data[tile.y][tile.x] === BRICK) {
            data[tile.y][tile.x] = ROAD;
        }
    }
    drawExplosion(tiles);
    checkActorHit(tiles);
    setTimeout(function () {
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            redrawTile(tile.x, tile.y);
        }
        if (!gameOver) {
            drawImage(actor.image, actor.x, actor.y);
        } else {
            renderGameOver();
        }
    }, EXPLOSION_DURATION);
}

var roleMove = function (code) {
    if (gameOver) {
        return;
    }
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
        placeBomb();
        drawImage(actor.image, actor.x, actor.y);
        return;
    }
    if (flag) {
        drawImage(actor.image, actor.x, actor.y);
    }
}

var doKeyDown = function (e) {
    if (gameOver) {
        return;
    }
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

    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    brickImage = document.getElementById('brick');
    wallImage = document.getElementById('wall');
    roleImage = document.getElementById('role');

    if (!brickImage || !wallImage || !roleImage) {
        console.error('Missing bomber sprite assets in DOM');
        return;
    }

    canvas.width = column * default_block_width;
    canvas.height = row * default_block_height;

    context = canvas.getContext('2d');
    context.fillStyle = BACKGROUND_COLOR;
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
                    addRole();
                });
            });
        });
    });
};