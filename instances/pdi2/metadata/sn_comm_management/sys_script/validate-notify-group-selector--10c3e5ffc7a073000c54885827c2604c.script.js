(function executeRule(current, previous /*null when async*/) {

	var sourceTable = current.comm_task_definition.comm_plan_definition.table;
	var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(sourceTable);
	var commTaskClass = handlerInstance.getCommTaskInstanceForTask();
	var isValidNotifySelector = new CommunicationManagementUtil().validateNotifyGroupSelector(commTaskClass, current);
	if (!isValidNotifySelector) {
		gs.addErrorMessage(gs.getMessage("Invalid choice of Notify group selector"));
		current.setAbortAction(true);
	}

})(current, previous);
