function route(pathname, handle,response,param) {
	console.log('route->pathname : '+pathname);
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response,param);
	} else {
		response.writeHead(200, {
			"Content-Type" : "text/plain"
		});
		response.write("404 NOT FOUND");
		response.end();
	}
}
exports.route = route;