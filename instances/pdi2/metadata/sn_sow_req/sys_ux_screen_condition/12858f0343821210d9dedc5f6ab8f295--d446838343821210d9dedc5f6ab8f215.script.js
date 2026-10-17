(function shouldRenderRequestTab(params) {
    var table = params.data.table;
    var sysId = params.data.sysId;

    if (gs.nil(table) || gs.nil(sysId) || table !== 'sysapproval_approver' || sysId === '-1') {
        return false;
    }

    var approvalForGr = '';
    var approvalApproverGr = new GlideRecord(table);
    if (approvalApproverGr.get(sysId) && !gs.nil(approvalApproverGr.sysapproval)) {
        approvalForGr = approvalApproverGr.sysapproval.getRefRecord();
    }

    return approvalForGr && approvalForGr.isValidRecord() && approvalForGr.canRead() && approvalForGr.getTableName() === 'sc_req_item';

})(inputProperties);
