(function() {
	var includeDescription = gs.getMessage("Implements extension point {0}", current.getValue("api_name"));
	var createdScript = gs.getMessage("New UI script created and registered as an extension point instance.");
	var cantCreate = gs.getMessage("Unable to automatically create an implementation of this extension point.");

	var newScript = new GlideRecord("sys_ui_script");
	newScript.initialize();
	newScript.setValue("script_name", current.getValue("name"));
	newScript.setValue("script", current.getValue("example"));
	newScript.setValue("description", includeDescription);

	if (current.getValue("description"))
		newScript.setValue("description", includeDescription + "\n" + current.getValue("description"));
	
	var inserted = newScript.insert();

	if (inserted) {
		//also register it
		var instance = new GlideRecord("sys_client_extension_instance");
		instance.initialize();
	
		if (instance.canCreate()) {
			instance.newRecord();
			instance.setValue("point", current.getValue("api_name"));
			instance.setValue("ui_script", inserted);
			instance.insert();
		}
		gs.addInfoMessage(createdScript);
		action.setRedirectURL(newScript);
	} else {
		gs.addInfoMessage(cantCreate);
		action.setRedirectURL(current);
	}
})();
