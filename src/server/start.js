var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var handle = {};
handle['/'] = requestHandlers.bomber;
handle['/bomber.html'] = requestHandlers.bomber;
handle['/init'] = requestHandlers.init;
handle['/js'] = requestHandlers.js;
handle['/resources'] = requestHandlers.resources;
server.start(router.route,handle);