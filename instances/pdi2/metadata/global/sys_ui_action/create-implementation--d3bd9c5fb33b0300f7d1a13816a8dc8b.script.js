(function() {
	var includeDescription = gs.getMessage("Implements extension point {0}", current.getValue("api_name"));
	var createdInclude = gs.getMessage("New script include created and registered as an extension point instance.");
	var cantCreate = gs.getMessage("Unable to automatically create an implementation of this extension point.");

	var newInclude = new GlideRecord("sys_script_include");
	newInclude.initialize();
	newInclude.setValue("name", current.getValue("name"));
	newInclude.setValue("script", current.getValue("example"));
	newInclude.setValue("description", includeDescription);

	if (current.getValue("description"))
		newInclude.setValue("description", includeDescription + "\n" + current.getValue("description"));
	
	var inserted = newInclude.insert();

	if (inserted) {
		//also register it
		var instance = new GlideRecord("sys_extension_instance");
		instance.initialize();
	
		if (instance.canCreate()) {
			instance.newRecord();
			instance.setValue("point", current.getValue("api_name"));
			instance.setValue("script_include", inserted);
			instance.insert();
		}
		gs.addInfoMessage(createdInclude);
		action.setRedirectURL(newInclude);
	} else {
		gs.addInfoMessage(cantCreate);
		action.setRedirectURL(current);
	}
})();
