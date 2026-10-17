(function executeRule(current, previous /*null when async*/) {

	// Disassociate approvals
	new ChangeRequestStateHandler(current).disassociateApprovalsFromWorkflow();

	// Set cancelled state on outstanding approvals
	var approvalUtils = new WorkflowApprovalUtils();
	var changeSysId = current.getUniqueValue();
	var statesToCancel = ['requested', 'not requested'];
	var msg = gs.getMessage('This approval record was canceled as a result of the related change request moving back to the {0} state.', current.state.getDisplayValue());
	
	approvalUtils.setUserApprovalsByTask(changeSysId, 'cancelled', msg, statesToCancel);
	approvalUtils.setGroupApprovalsByTask(changeSysId, 'cancelled', msg, statesToCancel);

	// reset approval status
	current.approval = 'not requested';

})(current, previous);
