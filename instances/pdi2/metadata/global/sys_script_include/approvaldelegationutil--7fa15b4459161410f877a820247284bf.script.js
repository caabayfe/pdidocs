var ApprovalDelegationUtil = Class.create();
ApprovalDelegationUtil.prototype = {
    initialize: function() {},

    getAllMyApprovals: function() {
        var approval_delegation_version = GlideProperties.get("glide.approval.delegation.version", "v1");
        switch (String(approval_delegation_version)) {
            case "v1":
                return this._getMyApprovalsWithOnlyApprovalDelegationPlugin();
            case "v2":
                return this._getMyApprovalsWithOnlyGranularApprovalDelegationPlugin();
            case "v3":
                return this._getMyApprovalsWithBothApprovalDelegationPlugins();
            default:
                gs.error("System property 'glide.approval.delegation.version' = " + approval_delegation_version + " is not supported.");
                return null;
        }
    },

    getAllMyRequestedApprovals: function() {
        var approval_delegation_version = GlideProperties.get("glide.approval.delegation.version", "v1");
        switch (String(approval_delegation_version)) {
            case "v1":
                return this._getMyRequestedApprovalsWithOnlyApprovalDelegationPlugin();
            case "v2":
                return this._getMyRequestedApprovalsWithOnlyGranularApprovalDelegationPlugin();
            case "v3":
                return this._getMyRequestedApprovalsWithBothApprovalDelegationPlugins();
            default:
                gs.error("System property 'glide.approval.delegation.version' = " + approval_delegation_version + " is not supported.");
                return null;
        }
    },

    getApprovers: function() {
        var approval_delegation_version = GlideProperties.get("glide.approval.delegation.version", "v1");
        switch (String(approval_delegation_version)) {
            case "v1":
                return getMyApprovals();
            case "v2":
                return gs.getUserID();
            case "v3":
                return getMyApprovals();
            default:
                gs.error("System property 'glide.approval.delegation.version' = " + approval_delegation_version + " is not supported.");
                return null;
        }
    },
	
    getMyAndDelegatedApprovals: function() {
        var approval_delegation_version = GlideProperties.get("glide.approval.delegation.version", "v1");
            switch (String(approval_delegation_version)) {
            case "v1":
                return null;
            case "v2":
                return this._getMyApprovalsWithOnlyGranularApprovalDelegationPlugin();
            case "v3":
                return this._getMyApprovalsWithOnlyGranularApprovalDelegationPlugin();
            default:
                gs.error("System property 'glide.approval.delegation.version' = " + approval_delegation_version + " is not supported.");
                return null;
        }
    },

    getOnlyDelegatedApprovals: function() {
        var approval_delegation_version = GlideProperties.get("glide.approval.delegation.version", "v1");
            switch (String(approval_delegation_version)) {
            case "v1":
                return null;
            case "v2":
                return this._getDelegatedApprovalsWithOnlyGranularApprovalDelegationPlugin();
            case "v3":
                return this._getDelegatedApprovalsWithOnlyGranularApprovalDelegationPlugin();
            default:
                gs.error("System property 'glide.approval.delegation.version' = " + approval_delegation_version + " is not supported.");
                return null;
        }
    },

    isMyApproval: function(gr) {
        var approval_delegation_version = GlideProperties.get("glide.approval.delegation.version", "v1");
        switch (String(approval_delegation_version)) {
            case "v1":
                return this._isMyApprovalWithOnlyApprovalDelegationPlugin(gr);
            case "v2":
                return this._isMyApprovalWithOnlyGranularApprovalDelegationPlugin(gr);
            case "v3":
                return this._isMyApprovalWithBothApprovalDelegationPlugins(gr);
            default:
                gs.error("System property 'glide.approval.delegation.version' = " + approval_delegation_version + " is not supported.");
                return false;
        }
    },

    isGranularApprovalDelegationEnabled: function() {
        return GlidePluginManager.isActive('com.glide.granular_service_delegation');
    },

    _getMyApprovalsWithOnlyApprovalDelegationPlugin: function() {
        var answer = [];
        var approvalGr = new GlideRecord("sysapproval_approver");
        approvalGr.addQuery("approver", "IN", getMyApprovals());
        approvalGr.query();
        while (approvalGr.next())
            answer.push(new String(approvalGr.sys_id));

        return answer;
    },

    _getMyRequestedApprovalsWithOnlyApprovalDelegationPlugin: function() {
        var answer = [];
        var approvalGr = new GlideRecord("sysapproval_approver");
        approvalGr.addQuery("approver", "IN", getMyApprovals());
	approvalGr.addQuery("state", "requested");
        approvalGr.query();
        while (approvalGr.next())
            answer.push(new String(approvalGr.sys_id));

        return answer;
    },

    _getMyApprovalsWithOnlyGranularApprovalDelegationPlugin: function() {
        if (this.isGranularApprovalDelegationEnabled()) {
            return new GranularApprovalDelegationUtil().getMyAndDelegatedApprovals();
        } else {
            gs.error("'com.glide.granular_service_delegation' plugin is not enabled.");
            return null;
        }
    },

    _getMyRequestedApprovalsWithOnlyGranularApprovalDelegationPlugin: function() {
        if (this.isGranularApprovalDelegationEnabled()) {
            return new GranularApprovalDelegationUtil().getRequestedMyAndDelegatedApprovals();
        } else {
            gs.error("'com.glide.granular_service_delegation' plugin is not enabled.");
            return null;
        }
    },

    _getDelegatedApprovalsWithOnlyGranularApprovalDelegationPlugin: function() {
        if (this.isGranularApprovalDelegationEnabled()) {
            return new GranularApprovalDelegationUtil().getOnlyDelegatedApprovals();
        } else {
            gs.error("'com.glide.granular_service_delegation' plugin is not enabled.");
            return null;
        }
    },

    _getMyApprovalsWithBothApprovalDelegationPlugins: function() {
        if (this.isGranularApprovalDelegationEnabled()) {
            var granular_approval_list = new GranularApprovalDelegationUtil().getMyAndDelegatedApprovals();
            var approval_list = this._getMyApprovalsWithOnlyApprovalDelegationPlugin();
            if (approval_list && approval_list.length > 0) {
                granular_approval_list = granular_approval_list.concat(approval_list);
            }
            return granular_approval_list;
        } else {
            return this._getMyApprovalsWithOnlyApprovalDelegationPlugin();
        }
    },

    _getMyRequestedApprovalsWithBothApprovalDelegationPlugins: function() {
        if (this.isGranularApprovalDelegationEnabled()) {
            var granular_approval_list = new GranularApprovalDelegationUtil().getRequestedMyAndDelegatedApprovals();
            var approval_list = this._getMyRequestedApprovalsWithOnlyApprovalDelegationPlugin();
            if (approval_list && approval_list.length > 0) {
                granular_approval_list = granular_approval_list.concat(approval_list);
            }
            return granular_approval_list;
        } else {
            return this._getMyRequestedApprovalsWithOnlyApprovalDelegationPlugin();
        }
    },

    _isMyApprovalWithOnlyApprovalDelegationPlugin: function(gr) {
        return isApprovalMine(gr);
    },

    _isMyApprovalWithOnlyGranularApprovalDelegationPlugin: function(gr) {
        if (this.isGranularApprovalDelegationEnabled()) {
            return new GranularApprovalDelegationUtil().isMyOrDelegatedApproval(gr);
        } else {
            gs.error("'com.glide.granular_service_delegation' plugin is not enabled.");
            return false;
        }
    },

    _isMyApprovalWithBothApprovalDelegationPlugins: function(gr) {
        if (this.isGranularApprovalDelegationEnabled()) {
            var answer = new GranularApprovalDelegationUtil().isMyOrDelegatedApproval(gr);
            if (!answer) {
                answer = isApprovalMine(gr);
            }
            return answer;
        } else {
            return isApprovalMine(gr);
        }
    },

    type: 'ApprovalDelegationUtil'
};
