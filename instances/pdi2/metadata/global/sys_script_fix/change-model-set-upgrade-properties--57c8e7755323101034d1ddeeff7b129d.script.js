(function(){
	if (GlidePluginManager.isZboot())
		return;
	
	gs.setProperty("com.snc.change_management.change_model.hide", "true", "If Type Compatibility is enabled (com.snc.change_management.change_model.type_compatibility), this hides the Change Model feature from the form and Change Request Interceptor.");
	gs.setProperty("com.snc.change_management.change_model.manage_workflow", "true", "Enables Workflow management support for ChangeRequest API if the com.snc.change_management.state_model plugin is installed.  This will call the 'deleteDefaultWorkflowContext' method to be called on specific state and type changes.");
	gs.setProperty("com.snc.change_management.change_model.type_compatibility", "true", "Enables Change Type Compatibility for Change Models if the com.snc.change_management.state_model plugin is installed.  When true allows changes to be created with both the type based workflow and Change Models.");
})();
