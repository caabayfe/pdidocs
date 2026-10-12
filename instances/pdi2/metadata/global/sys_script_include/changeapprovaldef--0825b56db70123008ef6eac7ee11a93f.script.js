var ChangeApprovalDef = Class.create();
ChangeApprovalDef.prototype = Object.extendsObject(ChangeApprovalDefSNC, {

	initialize: function(_gr) {
		ChangeApprovalDefSNC.prototype.initialize.call(this, _gr);
    },

    type: 'ChangeApprovalDef'
});
