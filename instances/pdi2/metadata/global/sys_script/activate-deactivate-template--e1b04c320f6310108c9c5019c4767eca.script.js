(function executeRule(current, previous /*null when async*/) {

	if (current.active == previous.active) {
		// If there is no change in the active flag then there's nothing to do.
		return;
	}
	
	try {
		var templateScriptableAPI = new sn_templates.TemplateScriptableAPI();
		if (current.active) {
			// The active flag is true, need to activate the template and associated flow if one exists.
			templateScriptableAPI.activateTemplate(current.sys_id);
		} else {
			templateScriptableAPI.deactivateTemplate(current.sys_id);
		}
	} catch (ex) {
		gs.addErrorMessage(ex.getMessage());
		current.setAbortAction(true);
	}

})(current, previous);
