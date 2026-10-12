var ChangeApprovalPolicySNC = Class.create();
ChangeApprovalPolicySNC.prototype = {

	initialize: function(_gr, _gs) {
		this._gr = _gr || current;
		this._gs = _gs || gs;
		this.changePolicy = new global.ChangePolicy(this._gr);
    },

	findAnswers: function(chgReqGR, variables) {
		return this.changePolicy.evaluatePolicy(chgReqGR, variables);
	},

    type: 'ChangeApprovalPolicySNC'
};
