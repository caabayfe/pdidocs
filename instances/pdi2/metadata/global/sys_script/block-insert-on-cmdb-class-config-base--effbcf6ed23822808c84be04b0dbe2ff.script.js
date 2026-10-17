(function executeRule(current, previous /*null when async*/) {
	// The base table is abstract: records must be created on an extension. extensions_only only
	// blocks the UI, so this rule enforces it for every path (including background GlideRecord inserts).
	if (current.getValue('sys_class_name') == 'cmdb_class_config_base') {
		gs.addErrorMessage(gs.getMessage(
			"CMDB Class Config records cannot be created directly on the base table"));
		current.setAbortAction(true);
	}
})(current, previous);
