var OnCallEscalationUtil = Class.create();
OnCallEscalationUtil.prototype = Object.extendsObject(OnCallEscalationUtilSNC, {
	initialize: function () {
		OnCallEscalationUtilSNC.prototype.initialize.call(this);
	},
	type: 'OnCallEscalationUtil'
});
