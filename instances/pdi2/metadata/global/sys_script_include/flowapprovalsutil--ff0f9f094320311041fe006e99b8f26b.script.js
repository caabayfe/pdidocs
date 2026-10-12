var FlowApprovalsUtil = Class.create();
FlowApprovalsUtil.prototype = {
    initialize: function() {
        this.SYSAPPROVAL_APPROVER = 'sysapproval_approver';
        this.SYS_FLOW_APPROVER_LISTENER_REFERENCE = 'sys_flow_approver_listener_reference';
        this.SYS_FLOW_GROUP_APPROVAL_LISTENER_REFERENCE = 'sys_flow_group_approval_listener_reference';
    },

    hasWorkflowWaitingForApprovals: function(approvalSysIds) {
        if (approvalSysIds.length == 0)
            return false;

        var WF_ACTIVITY = 'wf_activity';

        var approvalGr = new GlideRecord(this.SYSAPPROVAL_APPROVER);
        approvalGr.addQuery('sys_id', 'IN', approvalSysIds);
        approvalGr.addNotNullQuery(WF_ACTIVITY);
        approvalGr.query();

        var scratchpadIsActive = new GlidePluginManager().isActive('com.snc.encrypted.scratchpad');

        while (approvalGr.next()) {
            var executingGr = new GlideRecord('wf_executing');
            executingGr.addQuery('activity', approvalGr.getValue(WF_ACTIVITY));
            executingGr.addQuery('state', 'waiting');
            if (scratchpadIsActive) {
                if (approvalGr.getValue('document_id') != null) {
                   executingGr.addQuery('context.id', approvalGr.getValue('document_id'));
                } else if (approvalGr.getValue('sysapproval') != null) {
                   executingGr.addQuery('context.id', approvalGr.getValue('sysapproval'));
                } else {
                  continue;
                }
            } else {
                var qc = executingGr.addQuery('scratchpad', 'CONTAINS', approvalGr.getValue('sys_id'));
                if (approvalGr.getValue('group') != null) {
                    qc.addOrCondition('scratchpad', 'CONTAINS', approvalGr.getValue('group'));
                }
            }
            executingGr.setLimit(1);
            executingGr.query();
            if (executingGr.next()) {
                return true;
            }
        }
        return false;
    },

    hasFlowWaitingForApprovals: function(approvalSysIds) {
        if (approvalSysIds.length == 0) {
            return false;
        }
        if (this._isApprovalListenerWaiting(this.SYS_FLOW_APPROVER_LISTENER_REFERENCE, approvalSysIds))
            return true;
        return false;
    },

    _isApprovalListenerWaiting: function(tableName, approvalSysIds) {
        var approvalListenerRefGr = new GlideRecord(tableName);
        approvalListenerRefGr.addQuery('approval', 'IN', approvalSysIds);
        approvalListenerRefGr.addQuery('listener.state', 'WAITING');
        approvalListenerRefGr.setLimit(1);
        approvalListenerRefGr.query();
        return approvalListenerRefGr.next();
    },

    type: 'FlowApprovalsUtil'
};
