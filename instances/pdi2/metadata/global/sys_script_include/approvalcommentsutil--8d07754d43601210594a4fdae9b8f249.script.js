var ApprovalCommentsUtil = Class.create();
ApprovalCommentsUtil.prototype = {
    initialize: function() {
        this.SHOW_IMPERSONATE_COMMENT_ENABLED = gs.getProperty("com.glide.hub.flow.approval.show_impersonate_audit_comment", "false") == "true";
        this.SHOW_HIGHER_ROLE_COMMENT_ENABLED = gs.getProperty("com.glide.hub.flow.approval.show_higher_role_audit_comment", "false") == "true";
        this.HAS_HIGHER_ROLE = gs.hasRole('approval_admin') || gs.hasRole('itil') || gs.hasRole('catalog');
        this.SHOW_DELEGATE_COMMENT_ENABLED = gs.getProperty("com.glide.hub.flow.approval.show_delegate_audit_comment", "false") == "true";
    },

    getApprovalComment: function(current, isFD) {
        switch (current.getValue("state")) {
            case 'requested':
                // USER-A requested to approve task
                return this._getComment(isFD, this._getApproverUserName(current.approver), "requested to approve task");
            case 'rejected':
            case 'approved':
                return this._getCommentForApprovedOrRejected(current, isFD);
            default:
                return "";
        }
    },

    canAddCommentAsSystem: function(current) {
        var state = current.getValue("state");
        var anyFeatureEnabled = this.SHOW_IMPERSONATE_COMMENT_ENABLED || this.SHOW_HIGHER_ROLE_COMMENT_ENABLED || this.SHOW_DELEGATE_COMMENT_ENABLED;
        return (state == 'rejected' || state == 'approved') && anyFeatureEnabled;
    },

    _getCommentForApprovedOrRejected: function(current, isFD) {
        var approvalState = current.state;
        var isAuto = ((current.operation() == 'insert') && isFD) ? "auto " : "";
        var isSameUser = gs.getUserID() == current.approver.getValue();
        var canShowImpersonationComment = !isAuto && this.SHOW_IMPERSONATE_COMMENT_ENABLED;
        var canShowHigherRoleComment = !isAuto && this.SHOW_HIGHER_ROLE_COMMENT_ENABLED && this.HAS_HIGHER_ROLE && !isSameUser;
        var canShowDelegateComment = !isAuto && this.SHOW_DELEGATE_COMMENT_ENABLED && !isSameUser;
        var esignatureKey = 'esignature_audit_approvalcomment_' + current.sys_id;

        // USER-A approved/rejected the task by impersonating USER-B
        if (canShowImpersonationComment && GlideStringUtil.notNil(gs.getImpersonatingUserDisplayName())) {
            approvalComment = this._getComment(isFD, gs.getImpersonatingUserDisplayName(), approvalState + " the task by impersonating") + " " + gs.getUserDisplayName();
        } 
        // USER-A approved/rejected the task as delegate of USER-B
        else if (canShowDelegateComment && new ApprovalDelegationUtil().isMyApproval(current)) {
            approvalComment = this._getComment(isFD, gs.getUser().getDisplayName(), approvalState + " the task as delegate of") + " " + this._getApproverUserName(current.approver);
        } 
        // USER-A approved/rejected, permission granted by role
        else if (canShowHigherRoleComment) {
            approvalComment = this._getComment(isFD, gs.getUserDisplayName(), approvalState + ", permission granted by role");
        }
        // USER-A approved/rejected the task.
        else {
            approvalComment = this._getComment(isFD, this._getApproverUserName(current.approver), isAuto + approvalState + " the task.");
        }

        // this is used by e-Signature audit
        if (GlidePluginManager.isActive('com.glide.e_signature_approvals')) {
            gs.getSession().putProperty(esignatureKey, approvalComment);
        }

        return approvalComment;
    },

    _getApproverUserName: function(approver) {
        var username = approver.getDisplayValue();
        if (!GlideDomainSupport.isDataSeparationEnabled())
            return username;
        if (GlideStringUtil.notNil(username))
            return username;
        return sn_fd.FlowAPI.getApproverUsername(approver.sys_id);
    },

    _getComment: function(isFlowDesigner, username, comment) {
        if (isFlowDesigner) {
            var myComment = "{0} " + comment;
            return gs.getMessage(myComment, username);
        }
        return username + " " + comment;
    },

    type: 'ApprovalCommentsUtil'
};
