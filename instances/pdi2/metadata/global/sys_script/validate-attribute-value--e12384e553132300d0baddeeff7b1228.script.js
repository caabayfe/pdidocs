(function executeRule(current, previous /*null when async*/) {
	
	if (current.name.name == 'text_index_filterable' && !gs.hasRole('maint')) {
		current.name.setError(gs.getMessage("Invalid attribute."));
		current.setAbortAction(true);
		return;
	}

	var valid = new TSConfigurationUtil().validateAttributeValue(current.table, current.name.name, current.value);
	if (!valid) {
		current.value.setError(gs.getMessage("Invalid attribute value."));
		current.setAbortAction(true);
	}

})(current, previous);
