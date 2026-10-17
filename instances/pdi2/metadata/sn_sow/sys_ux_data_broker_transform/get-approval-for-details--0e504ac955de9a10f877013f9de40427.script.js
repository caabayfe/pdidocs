function transform(input) {
    var sysId = input.sysId;
    var approvalForTable = '';
    var approvalForSysId = '';

    var gr = new GlideRecord('sysapproval_approver');
    if (gr.get(sysId)) {
        if (!gr.sysapproval.nil()) {
            approvalForTable = gr.sysapproval.getRefRecord().getTableName();
            approvalForSysId = gr.getValue('sysapproval');
        } else if (!gr.source_table.nil() && !gr.document_id.nil()) {
            approvalForTable = gr.getValue('source_table');
            approvalForSysId = gr.getValue('document_id');
        }
    }
	
    return {
        'approvalForTable': approvalForTable,
        'approvalForSysId': approvalForSysId
    };
}
