(function process(/*ResolverEnvironment*/ env) {
	var result = {};
	var inputData = env.getArguments().parameters;
	var providerId;
	var parsedData = {};
	
	
	for(val in inputData) {
		var entry = inputData[val];
		parsedData[entry.name] = entry.sysId;
	}
	
	var sys_cs_collab_provider_application_id = parsedData['sys_cs_collab_provider_application_id'];
	
	var applicationGr = new GlideRecord("sys_cs_collab_provider_application");
	if(applicationGr.get(sys_cs_collab_provider_application_id)) {
		if(!applicationGr.canWrite() && !isInSelectedScope(applicationGr)) {
			result.success = false;
			var expectedScope = applicationGr.getDisplayValue('sys_scope') || 'Omni-Experience Standard Feature Set';
			result.message = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.', '<strong>' + expectedScope + '</strong>');
			return result;
		}
		providerId = applicationGr.provider;
		applicationGr.deleteRecord();
	} else {
		result.error = gs.getMessage("Unable to fetch sys_cs_collab_provider_application record for Teams. Contact system administrator for details");
		result.success = false;
		return result;
	}
	
	var providerProfileGr = new GlideRecord("sys_cs_collab_provider_user_profile");
	providerProfileGr.addQuery("provider", providerId);
	providerProfileGr.setValue("active", false);
	providerProfileGr.setWorkflow(false);
	providerProfileGr.updateMultiple();
	
	var settingsGr = new GlideRecord("sys_cs_collab_settings");
	settingsGr.query();
	if(settingsGr.next()) {
		settingsGr.setValue('enable_teams', false);
		settingsGr.update();
	}
	
	result.success = true;
	result.message = gs.getMessage("The teams integration has been successfully removed");
	return result;
	
	function isInSelectedScope(gr) {
		var currentScope = gs.getCurrentScopeName();
		var grScope = gr.getValue('sys_scope');
		return currentScope == grScope;
	}

})(env);
