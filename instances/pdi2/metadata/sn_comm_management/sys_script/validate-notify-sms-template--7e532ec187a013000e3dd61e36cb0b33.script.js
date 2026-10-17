(function executeRule(current, previous /*null when async*/) {

	var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(current.comm_task_definition.comm_plan_definition.table);
	var commTaskClass = handlerInstance.getCommTaskInstanceForTask();
	if(commTaskClass != current.notify_sms_template.table.toString()) {
		gs.addErrorMessage(gs.getMessage("Invalid choice of Notify SMS template"));
		current.setAbortAction(true);
	}

})(current, previous);
