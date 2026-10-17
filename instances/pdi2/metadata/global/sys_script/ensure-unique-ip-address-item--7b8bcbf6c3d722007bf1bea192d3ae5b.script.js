(function executeRule(current, previous) {

	var match = new GlideRecord('ip_address_item');
	match.addQuery('sys_id', '!=', current.sys_id);
	match.addQuery('ip_address', current.ip_address);
	match.addQuery('sys_domain', current.sys_domain);
	match.query();
	if (match.next()) {
		gs.addErrorMessage(gs.getMessage('IP item already exists'));
		current.setAbortAction(true);
	}

})(current, previous);
