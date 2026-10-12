var ApproverUtils = Class.create();
ApproverUtils.prototype = {
    initialize: function() {},

    canApproversRead: function() {
        var transaction = GlideTransaction.get();
        var targetRecord = JSUtil.notNil(transaction) ? transaction.getRequestParameter("sysparm_record_target") : null;
        var result = false;

        if (typeof g_approval_form_request != "undefined" && g_approval_form_request == true) {
            result = true;
        } else if (targetRecord != null && targetRecord == "sysapproval_approver" && targetRecord != current.getTableName()) {
            var target = new GlideRecord(targetRecord);
            if (target.get(transaction.getRequestParameter("sys_id")) && target.canRead()) {
                var approvingId = target.getValue('document_id');
                if (approvingId == null || approvingId == "")
                    approvingId = target.getValue('sysapproval');
                if (approvingId == current.sys_id)
                    result = true;
            }
        } else if (!current.nil() && transaction != null && (targetRecord == current.getTableName() || transaction.getRequestParameter("sys_popup_direct"))) {
            var sourceTable = transaction.getRequestParameter("sys_popup_direct") ? transaction.getRequestParameter("sysparm_table_name") : targetRecord;
            result = this.verify(sourceTable, current.getUniqueValue(), gs.getUserID());
        }

        return result;
    },

    verify: function(sourceTable, documentId, userId) {
        var gr = new GlideRecord('sysapproval_approver');
        gr.addQuery('approver', userId);
        gr.addQuery('document_id', documentId);
        gr.addQuery('source_table', sourceTable);
        gr.query();

        return (gr.next());
    },

    type: 'ApproverUtils'
};
