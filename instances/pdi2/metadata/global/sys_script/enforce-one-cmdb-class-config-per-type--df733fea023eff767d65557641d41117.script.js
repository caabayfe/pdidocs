(function executeRule(current, previous /*null when async*/) {
	// One configuration per (Config Type, CI Class, Domain) across all extensions (children share
	// the base physical table). Domain is included because the same CI class may be configured
	// once per domain. Replaces the former unique index so we can return a readable message.
	var dupe = new GlideRecord('cmdb_class_config_base');
	dupe.addQuery('config_type', current.getValue('config_type'));
	dupe.addQuery('ci_class', current.getValue('ci_class'));
	dupe.addQuery('sys_domain', current.getValue('sys_domain'));
	dupe.addQuery('sys_id', '!=', current.getUniqueValue()); // ignore self on update
	dupe.setLimit(1);
	dupe.query();
	if (dupe.next()) {
		gs.addErrorMessage(gs.getMessage(
			"A \"{0}\" configuration already exists for CI class \"{1}\" in this domain. Only one is allowed per CI class per domain.",
			[current.config_type.getDisplayValue(), current.getValue('ci_class')]));
		current.setAbortAction(true);
	}
})(current, previous);
