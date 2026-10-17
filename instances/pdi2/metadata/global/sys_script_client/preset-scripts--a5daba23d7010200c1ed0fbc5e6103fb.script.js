function onLoad() { 
	var script = g_form.getValue('script'); 
	var template = "isValidChange();\r\n\r\nfunction isValidChange(/*GlideRecord current, String updatedOn, String updatedBy, String changedFields*/) { \r\n //Type appropriate comment here, and begin script below, it must return a boolean value \r\n return true; \r\n}"; 
	if(script === ''){ 
		g_form.setValue('script', template); 
	} 
}
