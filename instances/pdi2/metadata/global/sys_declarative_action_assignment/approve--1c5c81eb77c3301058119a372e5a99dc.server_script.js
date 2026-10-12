var approveRecord = new GlideRecord('sysapproval_approver');
approveRecord.addEncodedQuery('source_table=cmdb_ci_business_process^document_id=' + current.getUniqueValue() + '^approver=' + gs.getUser().getID() + '^state=requested');
approveRecord.query();
if (approveRecord.next()) {
    approveRecord.state = 'approved';
    approveRecord.update();
    current.update();
    action.setRedirectURL(current);
    new ApprovalUserFeedback().approved(approveRecord);
}
