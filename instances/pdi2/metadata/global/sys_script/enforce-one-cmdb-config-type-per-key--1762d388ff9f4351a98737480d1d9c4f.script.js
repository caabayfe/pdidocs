(function executeRule(current, previous /*null when async*/) {
	// One config type per (Config key, Domain) - the same config_key may be redefined once per
	// domain, but never twice within the same domain. Replaces the former unique index so we can
	// return a readable message and factor in domain, which config_key alone can no longer do.
	var dupe = new GlideRecord('cmdb_config_type');
	dupe.addQuery('config_key', current.getValue('config_key'));
	dupe.addQuery('sys_domain', current.getValue('sys_domain'));
	dupe.addQuery('sys_id', '!=', current.getUniqueValue()); // ignore self on update
	dupe.setLimit(1);
	dupe.query();
	if (dupe.next()) {
		gs.addErrorMessage(gs.getMessage(
			"A configuration type with config key \"{0}\" already exists in this domain. Only one is allowed per domain.",
			[current.getValue('config_key')]));
		current.setAbortAction(true);
	}
})(current, previous);
