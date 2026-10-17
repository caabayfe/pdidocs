(function executeRule(current, previous /*null when async*/) {
	var active = (current.value == "true");

	//Get the Sys App Module for Knowledge Center
	var module = new GlideRecord("sys_app_module");
	module.get("e9eb8e3e9f082210ecf142a4ba0a1c9b");
	module.setValue("active", active);
	module.update();

	//Create/Delete m2m record for Workspaces Module
	var registry = new GlideRecord("sys_ux_registry_m2m_category");
	registry.addQuery("page_registry", "8317ecbf9f6b5210ecf142a4ba0a1c72");
	registry.addQuery("experience_category", "afb4e3e173322010f0ca1e666bf6a726");
	registry.query();
	if (active && !registry.hasNext()) {
		//create new record
		var newRegistry = new GlideRecord("sys_ux_registry_m2m_category");
		newRegistry.setValue("page_registry", "8317ecbf9f6b5210ecf142a4ba0a1c72");
		newRegistry.setValue("experience_category", "afb4e3e173322010f0ca1e666bf6a726");
		newRegistry.insert();
	}
	if (!active && registry.hasNext()) {
		registry.deleteMultiple();
	}


})(current, previous);
