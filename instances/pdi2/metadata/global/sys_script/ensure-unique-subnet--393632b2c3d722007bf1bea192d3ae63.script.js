(function executeRule(current, previous) {

	var match = new GlideRecord('ip_address_subnet');
	match.addQuery('sys_id', '!=', current.sys_id);
	match.addQuery('network_ip', current.network_ip);
	match.addQuery('netmask', current.netmask);
	match.addQuery('sys_domain', current.sys_domain);
	match.query();
	if (match.next()) {
		gs.addErrorMessage(gs.getMessage('Subnet already exists'));
		current.setAbortAction(true);
	}

})(current, previous);
