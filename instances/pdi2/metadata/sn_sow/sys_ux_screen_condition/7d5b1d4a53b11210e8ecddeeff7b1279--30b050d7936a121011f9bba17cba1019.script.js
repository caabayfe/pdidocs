(function shouldRenderRequestTab(params) {
    var table = params.data.table;
    var sysId = params.data.sysId;

    if (gs.nil(table) || gs.nil(sysId) || table !== 'sysapproval_approver' || sysId === '-1') {
        return false;
    }

    var approvalForGr = '';
    var approvalApproverGr = new GlideRecord(table);
    if (approvalApproverGr.get(sysId)) {
        if (!gs.nil(approvalApproverGr.sysapproval)) {
            approvalForGr = approvalApproverGr.sysapproval.getRefRecord();
        } else if (!gs.nil(approvalApproverGr.source_table) && !gs.nil(approvalApproverGr.document_id)) {
            approvalForGr = new GlideRecord(approvalApproverGr.getValue('source_table'));
            approvalForGr.get(approvalApproverGr.getValue('document_id'));
        }
    }

    return approvalForGr && approvalForGr.isValidRecord() && approvalForGr.canRead() && !['sn_shift_planning_agent_schedule_request', 'sn_shift_planning_shift_swap_request'].includes(approvalForGr.getTableName());
})(inputProperties);
