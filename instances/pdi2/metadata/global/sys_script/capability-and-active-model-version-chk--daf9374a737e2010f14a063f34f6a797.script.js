(function executeRule(current, previous /*null when async*/) {
	
	var currentCapability = current.getValue("capability");
	var mlHelper = AutoResolutionMLFactory.createMLHelperForCapability(currentCapability);
	
	if (currentCapability != AutoResolutionConstants.ML_CAPBILITIES.LANGUAGEX) {
		// if use legacy = false, we should not allow language config with agent_zero capability to be set to active
		// if use legacy = true, we should not allow language config with workflow capability to be set to active
		var expectedCapability = mlHelper.getCapability();
		if (expectedCapability !== currentCapability) {
			current.active = previous.active;
			gs.addErrorMessage(gs.getMessage("Model with capability={0} cannot be set to active as the system property={1} is set to use capability={2}. Update the system property to use the appropriate Issue Auto-Resolution solution.", [GlideStringUtil.escapeHTML(current.getValue("capability")), "glide.platform_ml.agent_zero.enable_legacy", GlideStringUtil.escapeHTML(expectedCapability)]));
			current.setAbortAction(true);
			gs.setRedirect(current);
		}
	}
	
	if (!mlHelper.hasActiveVersion(current.getValue("ml_solution_name"))) {
		current.active = previous.active;
		gs.addErrorMessage(gs.getMessage('Train the model to activate the language configuration for {0}.', GlideStringUtil.escapeHTML(current.training_language)));
		current.setAbortAction(true);
		gs.setRedirect(current);
	}
	

})(current, previous);
