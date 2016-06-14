var initData = require("./initMap");
var fs = require('fs');
function init(response, param) {
	response.writeHead(200, {
		"Content-Type" : "text/plain"
	});
	var rest = initData.initMapData();
	response.write(rest);
	response.end();
}
function bomber(response, param) {
	fs.readFile("../bomber.html", "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {
				"Content-Type" : "text/plain"
			});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {
				"Content-Type" : "text/html"
			});
			response.write(file, "binary");
			response.end();
		}
	});
}
function js(response, param) {
	fs.readFile("../js/"+param, "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {
				"Content-Type" : "text/plain"
			});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {
				"Content-Type" : "text/javascript"
			});
			response.write(file, "binary");
			response.end();
		}
	});
}
function resources(response, param) {
	fs.readFile("../resources/"+param, "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {
				"Content-Type" : "text/plain"
			});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {
				"Content-Type" : "image/png"
			});
			response.write(file, "binary");
			response.end();
		}
	});
}


exports.init = init;
exports.bomber = bomber;
exports.js = js;
exports.resources = resources;
