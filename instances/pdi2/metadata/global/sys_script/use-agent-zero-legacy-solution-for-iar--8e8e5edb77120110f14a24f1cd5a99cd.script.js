(function executeRule(current, previous /*null when async*/) {
	
	var configGr = new GlideRecord("sys_cs_auto_resolution_configuration");
	configGr.addQuery("target_table_name", "incident");
	configGr.query();
	
	if (!configGr.hasNext()) {
		current.value = previous.value;
		gs.addErrorMessage(gs.getMessage("Auto-Resolution configurations doesn't exist. Please install the required apps."));
		current.setAbortAction(true);
		gs.setRedirect(current);
		return;
	}
	
	configGr.next();
	
	if (current.getValue('value') === "false") {
		// need to set the configuration language with workflow capability active if there is a trained solution
		AutoResolutionLanguageHelper.setActiveOnTrainedLanguageConfigs(configGr.getUniqueValue(), AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW, true);
		AutoResolutionLanguageHelper.setActiveOnTrainedLanguageConfigs(configGr.getUniqueValue(), AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO, false);
				
		gs.addInfoMessage(gs.getMessage("Auto-Resolution workflow solution will be used for Issue Auto-Resolution."));
		return;		
	}
	
	
	// if the property value is set to true,
	// 1. De-activate the Auto-resolution configuration 
	// 2. we check and create a solution with agent zero legacy capbility
	var mlHelper = new AutoResolutionMLHelper(configGr.getUniqueValue());
	mlHelper.capability = AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO;
	var result = mlHelper.createSolutionAndTrain();

	if (result.status === "error") {	
		current.value = previous.value;
		gs.addErrorMessage(result.msg);
		gs.addErrorMessage(gs.getMessage("Set the value to true after you change the minimum number of records for the table."));
		current.setAbortAction(true);
		gs.setRedirect(current);
		return;
	}

	// get all the language configuration records with workflow capability and make it active=false
	AutoResolutionLanguageHelper.setActiveOnTrainedLanguageConfigs(configGr.getUniqueValue(), AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW, false);

	// get all the language configuration records with legacy agent zero capability and make it active=true if there is a trained solution
	AutoResolutionLanguageHelper.setActiveOnTrainedLanguageConfigs(configGr.getUniqueValue(), AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO, true);
		
	gs.addInfoMessage(gs.getMessage("Legacy Auto-Resolution solution will be used for Issue Auto-Resolution."));
	gs.addInfoMessage(gs.getMessage("The legacy Issue Auto-Resolution solution is now training and may take a while to complete. Check Issue Auto-Resolution Configuration to see the training status."));
	

})(current, previous);
