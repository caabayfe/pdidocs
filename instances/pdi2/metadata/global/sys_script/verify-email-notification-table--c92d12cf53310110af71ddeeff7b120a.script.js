(function executeRule(current, previous /*null when async*/) {
	
	var configTable = current.configuration.getRefRecord().getValue('target_table_name');
	var emailTemplateTable = current.email_notification.getRefRecord().getValue('collection');

	if (configTable !== emailTemplateTable) {
		var msg = gs.getMessage('The table for the email notification reminder must match the Auto-Resolution configuration table');
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}

})(current, previous);
