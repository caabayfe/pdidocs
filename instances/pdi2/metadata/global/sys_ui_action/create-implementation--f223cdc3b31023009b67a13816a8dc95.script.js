(function() {
	var includeDescription = gs.getMessage("Implements extension point {0}", current.getValue("api_name"));
	var macroCreated = gs.getMessage("New UI macro created and registered as an extension point instance.");
	var cantCreate = gs.getMessage("Unable to automatically create an implementation of this extension point.");
	var scopeName = gs.getCurrentScopeName();
	if (scopeName == "global" || scopeName == "rhino.global")
		scopeName = "";

	var newMacro = new GlideRecord("sys_ui_macro");
	newMacro.initialize();
	newMacro.setValue("name", current.getValue("name"));
	newMacro.setValue("xml", current.getValue("example"));
	newMacro.setValue("description", includeDescription);

	if (current.getValue("description"))
		newMacro.setValue("description", includeDescription + "\n" + current.getValue("description"));
	
	if (scopeName)
		newMacro.setValue("scoped_name", scopeName + "_" + current.getValue("name"));
	
	var inserted = newMacro.insert();

	if (inserted) {
		//also register it
		var instance = new GlideRecord("sys_ui_extension_instance");
		instance.initialize();
	
		if (instance.canCreate()) {
			instance.newRecord();
			instance.setValue("point", current.getValue("api_name"));
			instance.setValue("ui_macro", inserted);
			instance.insert();
		}
		gs.addInfoMessage(macroCreated);
		action.setRedirectURL(newMacro);
	} else {
		gs.addInfoMessage(cantCreate);
		action.setRedirectURL(current);
	}
})();
