/**
 * Created by guangli on 2016/6/13.
 */

var data = [],//数据
    visit = [],
    row = 30,
    column = 40,
    WALL = 2,
    BRICK = 1,
    ROAD = 0,
    type = [0, 1, 2, 3],
    path = [];

function initMapData(r, c) {
    row = r ? r : row;
    column = c ? c : column;
    // 初始化原始地图数据
    for (var i = 0; i < row; i++) {
        var oneRow = [];
        for (var j = 0; j < column; j++) {
            if (i == 0 || j == 0 || i == row - 1 || j == column - 1) {
                oneRow[j] = WALL;//地图外围砖墙包围
            } else {
                var value = type[parseInt(Math.random() * 4)];
                oneRow[j] = value;
            }
        }
        data[i] = oneRow;
    }
// 将有环路的墙全部打掉
    for (var i = 1; i < row - 1; i++) {
        for (var j = 1; j < column - 1; j++) {
            if (testPath(i, j)) {
                data[i][j] = ROAD;//将构成环路的节点打通
            }
        }
    }
    // 角色初始化的位置，四个角的位置空出来
    data[1][1] = data[1][2] = data[2][1] =
        data[1][column - 2] = data[1][column - 3] = data[2][column - 2] =
            data[row - 2][1] = data[row - 2][2] = data[row - 3][1] =
                data[row - 2][column - 2] = data[row - 2][column - 3] = data[row - 3][column - 2] = ROAD;
    return JSON.stringify(data);
}
var Point = function (x, y) {
    this.x = x;
    this.y = y;
    this.z = 0;
}
/**
 *
 * 判断一个节点是否在回路中
 *
 * @param x
 * @param y
 * @return
 */
function testPath(x, y) {
    for (var i = 0; i < row; i++) {
        var oneRow = [];
        for (var j = 0; j < column; j++) {
            oneRow[j] = 0;
        }
        visit[i] = oneRow;
    }
    if (data[x][y] == WALL) {
        path = [];
        return searchPath(new Point(x, y));
    } else {
        return false;
    }
};

/**
 * 节点p是否在路径中已经存在
 *
 * @param p
 * @return
 */
function containts(p) {
    var rest = false;
    for (var i = 0; i < path.length; i++) {
        var point = path[i];
        if (p.x == point.x && p.y == point.y) {
            rest = true;
            break;
        }
    }
    return rest;
};

/**
 * 探测以x,y为出发点的8个方向，判断x,y点是否形成一个回路
 *
 * @param x
 * @param y
 * @return
 */
function searchPath(p) {
    //console.log('(x:'+ p.x+',y:'+ p.y+')')
    if (!containts(p)) {//如果在路径中不存在
        var parent;
        if (path.length > 0) {
            parent = path[path.length - 1];
        } else {
            parent = new Point(-1, -1);
        }
        if (p.y + 1 <= column - 1 && data[p.x][p.y + 1] == WALL
            && visit[p.x][p.y + 1] == 0 && !(parent.x == p.x && parent.y == p.y + 1)) {// 向右搜索一格
            var next = new Point(p.x, p.y + 1);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.x + 1 <= row - 1 && p.y + 1 <= column - 1
            && data[p.x + 1][p.y + 1] == WALL
            && visit[p.x + 1][p.y + 1] == 0 && !(parent.x == p.x + 1 && parent.y == p.y + 1)) { // 向右下搜索一格
            var next = new Point(p.x + 1, p.y + 1);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.x + 1 <= row - 1 && data[p.x + 1][p.y] == WALL
            && visit[p.x + 1][p.y] == 0 && !(parent.x == p.x + 1 && parent.y == p.y)) {// 向下搜索一格
            var next = new Point(p.x + 1, p.y);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.x + 1 <= row - 1 && p.y - 1 >= 0
            && data[p.x + 1][p.y - 1] == WALL
            && visit[p.x + 1][p.y - 1] == 0 && !(parent.x == p.x + 1 && parent.y == p.y - 1)) {// 向左下搜索一格
            var next = new Point(p.x + 1, p.y - 1);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.y - 1 >= 0 && data[p.x][p.y - 1] == WALL
            && visit[p.x][p.y - 1] == 0 && !(parent.x == p.x && parent.y == p.y - 1)) {// 向左搜索一格
            var next = new Point(p.x, p.y - 1);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.x - 1 >= 0 && p.y - 1 >= 0 && data[p.x - 1][p.y - 1] == WALL
            && visit[p.x - 1][p.y - 1] == 0 && !(parent.x == p.x - 1 && parent.y == p.y - 1)) {// 向左上搜索一格
            var next = new Point(p.x - 1, p.y - 1);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.x - 1 >= 0 && data[p.x - 1][p.y] == WALL
            && visit[p.x - 1][p.y] == 0 && !(parent.x == p.x - 1 && parent.y == p.y)) {// 向上搜索一格
            var next = new Point(p.x - 1, p.y);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }
        if (p.y + 1 <= column - 1 && p.x - 1 >= 0
            && data[p.x - 1][p.y + 1] == WALL
            && visit[p.x - 1][p.y + 1] == 0 && !(parent.x == p.x - 1 && parent.y == p.y + 1)) {// 向右上搜索一格
            var next = new Point(p.x - 1, p.y + 1);
            path.push(p);
            if (searchPath(next)) {
                return true;
            }
        }

        if (path.length > 0) {
            var p3 = path.pop();
            visit[p.x][p.y] = -2;
            return searchPath(p3);
        } else {
            return false;
        }
    } else {//如果在路径中存在，可能会存在环路
        if (p.x == path[0].x && p.y == path[0].y && path.length >= 4) {
            return true;
        } else {
            path.pop();
            return false;
        }
    }
};

//console.log(initMapData());
exports.initMapData = initMapData;

