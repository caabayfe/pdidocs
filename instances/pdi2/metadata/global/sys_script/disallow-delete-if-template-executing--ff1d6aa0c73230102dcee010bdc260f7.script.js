(function executeRule(current, previous /*null when async*/) {

	if (gs.nil(current)){
		// to prevent null pointer exceptions.
		return;
	}
	
	var templateSysId = current.sys_id;
	
	var sysAppTemplateInstance = new GlideRecord("sys_app_template_instance");
	sysAppTemplateInstance.addQuery("template", templateSysId);
	sysAppTemplateInstance.addQuery("state", "IN", ["running", "pending"]);
	sysAppTemplateInstance.query();
	
	if (!sysAppTemplateInstance.next()) {
		// there were no pending/running template instance records for this template, allow delete
		return;
	}

	var translatedMessage = gs.getMessage("Unable to delete the template with sys_id '{0}' because it is currently running or pending execution.", templateSysId);
	gs.addInfoMessage(translatedMessage);
	
	current.setAbortAction(true);
	
})(current, previous);
