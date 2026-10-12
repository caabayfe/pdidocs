var ChangeFlowUtil = Class.create();
ChangeFlowUtil.prototype = Object.extendsObject(ChangeFlowUtilSNC, {

	initialize: function(changeRequestGR) {
		ChangeFlowUtilSNC.prototype.initialize.call(this, changeRequestGR);
	},

	type: 'ChangeFlowUtil'
});
