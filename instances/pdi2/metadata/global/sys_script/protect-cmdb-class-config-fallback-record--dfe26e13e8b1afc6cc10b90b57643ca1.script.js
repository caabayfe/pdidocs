(function executeRule(current, previous /*null when async*/) {
	// The cmdb_ci fallback record for each config type is required and largely immutable: it cannot
	// be deleted, and its CI Class, Config Type, Domain and Active flag cannot change. Only the value
	// is editable. This only protects the GLOBAL domain's cmdb_ci row - a domain-scoped cmdb_ci row is
	// that domain's own override, not the shipped fallback, so it is free to be changed or removed.
	function isGlobalFallback(gr) {
		return gr.getValue('ci_class') == 'cmdb_ci' && gr.getValue('sys_domain') == 'global';
	}

	var isFallback = isGlobalFallback(current) || (previous != null && isGlobalFallback(previous));
	if (!isFallback)
		return;

	if (current.operation() == 'delete') {
		gs.addErrorMessage(gs.getMessage("The base configuration (CI Class 'cmdb_ci', Domain 'global') is required and cannot be deleted."));
		current.setAbortAction(true);
		return;
	}

	// update of the global cmdb_ci fallback record
	if (current.getValue('ci_class') != 'cmdb_ci') {
		gs.addErrorMessage(gs.getMessage("The CI Class of the base configuration (cmdb_ci) cannot be changed"));
		current.setAbortAction(true);
	} else if (current.getValue('sys_domain') != 'global') {
		gs.addErrorMessage(gs.getMessage("The Domain of the base configuration (cmdb_ci, global) cannot be changed"));
		current.setAbortAction(true);
	} else if (current.getValue('config_type') != previous.getValue('config_type')) {
		gs.addErrorMessage(gs.getMessage("The Config Type of the base configuration (cmdb_ci) cannot be changed"));
		current.setAbortAction(true);
	} else if (current.getValue('active') != previous.getValue('active')) {
		gs.addErrorMessage(gs.getMessage("The Active flag of the base configuration (cmdb_ci) cannot be changed"));
		current.setAbortAction(true);
	}
})(current, previous);
