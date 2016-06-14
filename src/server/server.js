var http = require("http");
var url = require("url");
function start(route,handle) {
	http.createServer(function(request, response) {
		var pathname = url.parse(request.url).pathname;
		var params = pathname.split('/');
		//console.log(params);
		if(params.length > 1){
			route('/'+params[1],handle,response,params[2]);
		}else{
			route('/'+params[1],handle,response);
		}
	}).listen(80);
	console.log("Server has started.");
}
exports.start = start;
