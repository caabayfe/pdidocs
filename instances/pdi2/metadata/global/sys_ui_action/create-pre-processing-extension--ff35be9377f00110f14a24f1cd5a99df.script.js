(function() {
	var includeDescription = gs.getMessage("Implements extension point {0}", AutoResolutionConstants.PRE_PROCESSING_EXT_POINT_API_NAME);
	var createdInclude = gs.getMessage("New script include created and registered as an extension point instance.");
	var cantCreate = gs.getMessage("Unable to automatically create an implementation of this extension point.");
	
	var preProcessExtPtGr = new GlideRecord('sys_extension_point');
	preProcessExtPtGr.addQuery("api_name", AutoResolutionConstants.PRE_PROCESSING_EXT_POINT_API_NAME);
	preProcessExtPtGr.query();
	if (!preProcessExtPtGr.next()) {
		gs.addErrorMessage(gs.getMessage('Pre processing extension point is not found for Issue Auto-Resolution'));
		action.setRedirectURL(current);
	}
		

	var newInclude = new GlideRecord("sys_script_include");
	newInclude.initialize();
	newInclude.setValue("name", preProcessExtPtGr.getValue("name"));
	newInclude.setValue("script", preProcessExtPtGr.getValue("example"));
	newInclude.setValue("description", includeDescription);
	newInclude.setValue("access", "public"); //All application scopes

	if (preProcessExtPtGr.getValue("description"))
		newInclude.setValue("description", includeDescription + "\n" + preProcessExtPtGr.getValue("description"));
	
	var inserted = newInclude.insert();
	var instanceInserted = '';
	
	if (inserted) {
		//also register it
		var instance = new GlideRecord("sys_extension_instance");
		instance.initialize();
	
		if (instance.canCreate()) {
			instance.newRecord();
			instance.setValue("point", preProcessExtPtGr.getValue("api_name"));
			instance.setValue("script_include", inserted);
			instanceInserted = instance.insert();			
		}
		
		current.setValue("pre_processing_extension", instanceInserted);
		current.update();
		
		gs.addInfoMessage(createdInclude);
		action.setRedirectURL(newInclude);
	} else {
		gs.addInfoMessage(cantCreate);
		action.setRedirectURL(current);
	}
})();
