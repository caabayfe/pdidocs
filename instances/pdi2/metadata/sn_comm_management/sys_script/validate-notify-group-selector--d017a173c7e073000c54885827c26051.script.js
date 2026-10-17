(function executeRule(current, previous /*null when async*/) {

	var commTaskClass = current.comm_task.getRefRecord().getRecordClassName();
	var isValidNotifySelector = new CommunicationManagementUtil().validateNotifyGroupSelector(commTaskClass, current);
	if (!isValidNotifySelector) {
		gs.addErrorMessage(gs.getMessage("Invalid choice of Notify group selector"));
		current.setAbortAction(true);
	}

})(current, previous);
