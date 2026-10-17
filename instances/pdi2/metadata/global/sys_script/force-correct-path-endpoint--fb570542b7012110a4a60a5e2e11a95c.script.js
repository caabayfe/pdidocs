(function executeRule(current, previous /*null when async*/) {
	if (JSUtil.nil(current.sys_scope) || (current.sys_scope.scope == 'global')) {
		if (JSUtil.notNil(current.path_endpoint)) {
			gs.addErrorMessage(gs.getMessage("For global processors, Path Endpoint should be empty."));
			current.setAbortAction(true);
		}
	} else if (!current.path_endpoint.startsWith(current.sys_scope.scope)) {
			gs.addErrorMessage(gs.getMessage("For scoped applications, Path Endpoint must start with application scope."));
			current.setAbortAction(true);
		}
		
})(current, previous);
