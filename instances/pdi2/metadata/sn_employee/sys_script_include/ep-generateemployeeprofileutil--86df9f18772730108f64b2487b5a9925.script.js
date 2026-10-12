var ep_generateEmployeeProfileUtil = Class.create();
ep_generateEmployeeProfileUtil.prototype = Object.extendsObject(ep_generateEmployeeProfileUtilSNC, {
	initialize: function () {
		ep_generateEmployeeProfileUtilSNC.prototype.initialize.apply(this, arguments);
	},
	
    type: 'ep_generateEmployeeProfileUtil'
});
