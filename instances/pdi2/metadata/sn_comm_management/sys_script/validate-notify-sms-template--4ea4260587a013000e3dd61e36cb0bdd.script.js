(function executeRule(current, previous /*null when async*/) {

	var commTaskClass = current.comm_task.getRefRecord().getRecordClassName();
	if(commTaskClass != current.notify_sms_template.table.toString()) {
		gs.addErrorMessage(gs.getMessage("Invalid choice of Notify SMS template"));
		current.setAbortAction(true);
	}

})(current, previous);
