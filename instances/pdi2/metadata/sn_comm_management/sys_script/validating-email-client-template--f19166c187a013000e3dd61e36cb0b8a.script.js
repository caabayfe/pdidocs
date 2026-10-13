(function executeRule(current, previous /*null when async*/) {

	var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(current.comm_task_definition.comm_plan_definition.table);
	var commTaskClass = handlerInstance.getCommTaskInstanceForTask();
	if(commTaskClass != current.email_client_template.table.toString()) {
		gs.addErrorMessage(gs.getMessage("Invalid choice of Email Client template"));
		current.setAbortAction(true);
	}

})(current, previous);
