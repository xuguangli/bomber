var http = require("http");
var url = require("url");
function start(route,handle) {
	http.createServer(function(request, response) {
		var pathname = url.parse(request.url).pathname;
		var params = pathname.split('/');
		var p = url.parse(request.url, true).query; //请求参数
		var o = {
			'res':params[2]?params[2]:'undefined',
			'param':p
		};

		if(params.length > 1){
			route('/'+params[1],handle,response,o);
		}else{
			route('/'+params[1],handle,response);
		}
	}).listen(80);
	console.log("Server has started.");
}
exports.start = start;
