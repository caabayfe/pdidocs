(function executeRule(current, previous /*null when async*/) {
	var grConfig = new GlideRecord('ais_genius_result_configuration');
	grConfig.addQuery('sys_id', '!=', current.getUniqueValue());
	grConfig.addQuery('name', current.getValue('name'));
	grConfig.query();
	if (grConfig.next()) {
		gs.addErrorMessage(gs.getMessage('Genius result configuration with same name already exists'));
		current.setAbortAction(true);
	}
})(current, previous);
