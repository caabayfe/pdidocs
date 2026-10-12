(function executeRule(current, previous /*null when async*/) {
	var grAis = new GlideRecord('ais_connection');
	grAis.addQuery('type', '0');
	grAis.addQuery('sys_id', '!=', current.getUniqueValue());
	grAis.query();
	if (grAis.next()) {
		gs.addErrorMessage(gs.getMessage("Only one primary connection should be configured"));
		current.setAbortAction(true);
	}
})(current, previous);
