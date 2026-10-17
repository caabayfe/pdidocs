(function executeRule(current, previous /*null when async*/) {
	
	var currentClass = current.getValue('class');
	if (current.managed_by_group && (currentClass == 'service_offering' || currentClass == 'cmdb_ci_query_based_service')) {
		gs.addErrorMessage(gs.getMessage('The Managed By Group attribute cannot be set on {1}', currentClass));
		current.setAbortAction(true);
	}

})(current, previous);
