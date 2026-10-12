function onBefore(current, previous) {
	//This function will be automatically called when this rule is processed.
	if (!RestValidator.isUniqueBasePath(current.sys_id, current.base_uri)) {
		current.setAbortAction(true);
		gs.addErrorMessage("API ID '" + current.service_id + "' is already defined in namespace '" + current.namespace + "'.");
	}
}
