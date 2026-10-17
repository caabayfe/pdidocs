(function executeRule(current, previous /*null when async*/) {

	var existing = new GlideRecord('sys_email_client_configuration');
	existing.addActiveQuery();
	existing.addQuery('table', current.table);
	existing.addQuery('sys_id', '!=', current.getUniqueValue());
	existing.query();
	if (existing.next()) {
		var msgArray = [current.table, existing.name];
		gs.addInfoMessage(gs.getMessage('table must be unique: {0} already exists in configuration: {1}', msgArray));
		current.setAbortAction(true);
	}
	
})(current, previous);
