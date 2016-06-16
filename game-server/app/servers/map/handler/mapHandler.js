var initData = require("./mapTool");
module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

Handler.prototype.initMap = function(msg,session,next){
	var rest = initData.initMapData(msg.row, msg.column);
	next(null, {code: 200, msg: rest});
}