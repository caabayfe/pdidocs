(function executeRule(current, previous /*null when async*/) {
	
	var reminderGr = new GlideRecord('sys_cs_auto_resolution_reminder');
	
	// Do not check against this reminder istelf
	reminderGr.addQuery('sys_id', 'NOT IN', current.getUniqueValue());
	
	reminderGr.addQuery('percentage', current.percentage);
	reminderGr.addQuery('configuration', current.configuration);
	reminderGr.query();
	if (reminderGr.hasNext()) {
		var configurationName = current.configuration.getRefRecord().getDisplayValue('target_table_name');
		var message = gs.getMessage('A reminder with the SLA percentage {0} already exists for configuration {1}.',
									[current.percentage, GlideStringUtil.escapeHTML(configurationName)]);
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}

})(current, previous);
