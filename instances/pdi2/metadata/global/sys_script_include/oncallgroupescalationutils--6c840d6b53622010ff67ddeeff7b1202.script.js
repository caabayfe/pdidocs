var OnCallGroupEscalationUtils = Class.create();

OnCallGroupEscalationUtils.prototype = Object.extendsObject(OnCallGroupEscalationUtilsSNC, {
	initialize: function () {
		OnCallGroupEscalationUtilsSNC.prototype.initialize.call(this);
	},
	type: 'OnCallGroupEscalationUtils'
});
