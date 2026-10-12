(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var extensions = new GlideRecord("sys_extension_point");
	extensions.addQuery("api_name", current.getValue("api_name"));
	extensions.addQuery("sys_scope", current.getValue("sys_scope"));
	extensions.addQuery("sys_id", "!=", current.getUniqueValue());
	extensions.query();
	
	if (extensions.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Extension point names must be unique within an application (or global)"));
		current.setAbortAction(true);
	}

})(current, previous);
