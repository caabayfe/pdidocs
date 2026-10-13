(function executeRule(current, previous /*null when async*/) {

	var commTaskClass = current.comm_task.getRefRecord().getRecordClassName();
	if(commTaskClass != current.email_client_template.table.toString()) {
		gs.addErrorMessage(gs.getMessage("Invalid choice of Email Client template"));
		current.setAbortAction(true);
	}

})(current, previous);
