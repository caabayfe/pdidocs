(function executeRule(current, previous) {

	var recordNeedsApproval = new GlideRecord("sys_report_access_request");
	recordNeedsApproval.get(previous.document_id);
	if (!new global.ApprovalDelegationUtil().isMyApproval(recordNeedsApproval)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Only the approver or an approval delegate can modify this record"));
	}

})(current, previous);
