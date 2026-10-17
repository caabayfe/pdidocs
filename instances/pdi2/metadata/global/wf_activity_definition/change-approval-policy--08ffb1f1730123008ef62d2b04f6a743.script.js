var Change_Approval_PolicyActivityHandler = Class.create();
Change_Approval_PolicyActivityHandler.prototype = Object.extendsObject(global.ChangePolicyApprovalActivity, {

	initialize: function() {
		global.ChangePolicyApprovalActivity.prototype.initialize.call(this, current, gs, activity, context, workflow);
	},

	type: "Change_Approval_PolicyActivityHandler"
});
