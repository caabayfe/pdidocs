var GranularApprovalDelegationUtil = Class.create();
GranularApprovalDelegationUtil.prototype = {
    initialize: function() {},

    getMyAndDelegatedApprovals: function() {
        var user_id = gs.getUserID();
        var answer = [];
        var approvalGr = new sn_delegation.DelegationUtil().getDelegatedApprovalsForUser(user_id, true);
        while (approvalGr.next())
            answer.push(new String(approvalGr.sys_id));

        return answer;
    },

    getRequestedMyAndDelegatedApprovals: function() {
        var user_id = gs.getUserID();
        var answer = [];
        var approvalGr = new sn_delegation.DelegationUtil().getDelegatedApprovalsForUser(user_id, true);
        while (approvalGr.next()) {
		if (approvalGr.getValue("state") == "requested") {
			answer.push(new String(approvalGr.getUniqueValue()));
		}
	}

        return answer;
    },

    getOnlyDelegatedApprovals: function() {
        var user_id = gs.getUserID();
        var answer = [];
        var approvalGr = new sn_delegation.DelegationUtil().getDelegatedApprovalsForUser(user_id, false);
        while (approvalGr.next())
            answer.push(new String(approvalGr.sys_id));

        return answer;
    },

    isMyOrDelegatedApproval: function(gr) {
        var approver = gr.approver + '';
        if (!gr.isValidField('approver'))
            approver = '';
        var approverSysId = gr.sys_id + '';
        if (JSUtil.nil(approver) && JSUtil.notNil(approverSysId)) {
            var app = new GlideRecord('sysapproval_approver');
            if (gr.getTableName() == 'sysapproval_group')
                app.addQuery('group', approverSysId);
            else
                app.addQuery('sysapproval', approverSysId);
            app.query();
            while (app.next()) {
                approver = app.approver;
                if (this._checkApproverOrDelegation(approver, gr))
                    return true;
            }
        }
        return this._checkApproverOrDelegation(approver, gr);
    },

    _checkApproverOrDelegation: function(approver, gr) {
        if (JSUtil.nil(approver))
            return false;

        var user_id = gs.getUserID();
        var user = new String(user_id);
        if (user == approver)
            return true;

        var answer = new sn_delegation.DelegationUtil().isRecordDelegatedToUser(user_id, gr);
        return answer;
    },

    type: 'GranularApprovalDelegationUtil'
};
