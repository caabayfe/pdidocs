(function executeRule(current, previous /*null when async*/) {

	var templateDetailsGR = new GlideRecord('sys_app_template_detail');
	
	templateDetailsGR.newRecord();
	templateDetailsGR.setValue('template', current.sys_id);
	
	if (!templateDetailsGR.insert()) {
		var errorMessage = gs.getMessage("Failed to create sys_app_template_detail record for template with sys_id: '{0}'", [current.sys_id]);
		gs.addErrorMessage(errorMessage);
	}

})(current, previous);
