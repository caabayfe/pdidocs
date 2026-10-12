var ChangeApprovalPolicy = Class.create();
ChangeApprovalPolicy.prototype = Object.extendsObject(ChangeApprovalPolicySNC, {

	initialize: function(_gr) {
		ChangeApprovalPolicySNC.prototype.initialize.call(this, _gr);
    },

    type: 'ChangeApprovalPolicy'
});
