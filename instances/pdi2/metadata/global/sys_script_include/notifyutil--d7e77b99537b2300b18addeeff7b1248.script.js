var NotifyUtil = Class.create();
NotifyUtil.prototype = Object.extendsObject(global.NotifyUtilSNC, {

	initialize: function() {
		global.NotifyUtilSNC.prototype.initialize.call(this);
	},
	
});
