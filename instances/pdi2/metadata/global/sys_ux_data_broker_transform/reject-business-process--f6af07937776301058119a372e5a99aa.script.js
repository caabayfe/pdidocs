function tranform(input) {
    if (input.comments && input.table == "cmdb_ci_business_process" && new global.BusinessProcessUtils().canShowApproveOrRejectButton(input.sysId)) {
        var gr = new GlideRecord('sysapproval_approver');
        gr.addQuery('source_table', input.table);
        gr.addQuery('document_id', input.sysId);
        gr.addQuery('approver', gs.getUser().getID());
        gr.addQuery('state', 'requested');
        gr.query();
        if (gr.next()) {
            gr.setValue('state', 'rejected');
            gr.comments = input.comments;
            gr.update();
            new ApprovalUserFeedback().rejected(gr);
        }
    }
}
