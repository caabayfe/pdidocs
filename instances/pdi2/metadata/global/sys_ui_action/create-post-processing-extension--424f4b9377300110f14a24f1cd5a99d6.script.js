(function() {
	var includeDescription = gs.getMessage("Implements extension point {0}", AutoResolutionConstants.POST_PROCESSING_EXT_POINT_API_NAME);
	var createdInclude = gs.getMessage("New script include created and registered as an extension point instance.");
	var cantCreate = gs.getMessage("Unable to automatically create an implementation of this extension point.");
	
	var postProcessExtPtGr = new GlideRecord('sys_extension_point');
	postProcessExtPtGr.addQuery("api_name", AutoResolutionConstants.POST_PROCESSING_EXT_POINT_API_NAME);
	postProcessExtPtGr.query();
	if (!postProcessExtPtGr.next()) {
		gs.addErrorMessage(gs.getMessage('Post processing extension point is not found for Issue Auto-Resolution'));
		action.setRedirectURL(current);
	}
		

	var newInclude = new GlideRecord("sys_script_include");
	newInclude.initialize();
	newInclude.setValue("name", postProcessExtPtGr.getValue("name"));
	newInclude.setValue("script", postProcessExtPtGr.getValue("example"));
	newInclude.setValue("description", includeDescription);
	newInclude.setValue("access", "public"); //All application scopes

	if (postProcessExtPtGr.getValue("description"))
		newInclude.setValue("description", includeDescription + "\n" + postProcessExtPtGr.getValue("description"));
	
	var inserted = newInclude.insert();
	var instanceInserted = '';

	if (inserted) {
		//also register it
		var instance = new GlideRecord("sys_extension_instance");
		instance.initialize();
	
		if (instance.canCreate()) {
			instance.newRecord();
			instance.setValue("point", postProcessExtPtGr.getValue("api_name"));
			instance.setValue("script_include", inserted);
			instanceInserted = instance.insert();
		}
		
		current.setValue("post_processing_extension", instanceInserted);
		current.update();
		
		gs.addInfoMessage(createdInclude);
		action.setRedirectURL(newInclude);
	} else {
		gs.addInfoMessage(cantCreate);
		action.setRedirectURL(current);
	}
})();
