(function executeRule(current, previous /*null when async*/) {

	var existing = new GlideRecord('sys_email_client_configuration');
	existing.addActiveQuery();
	existing.addQuery('default_configuration', true);
	existing.addQuery('sys_id', '!=', current.getUniqueValue());
	existing.query();
	if (existing.next()) {
		gs.addInfoMessage(gs.getMessage('only 1 active default allowed: default already exists named: {0}', existing.name));
		current.setAbortAction(true);
	}
	
})(current, previous);
