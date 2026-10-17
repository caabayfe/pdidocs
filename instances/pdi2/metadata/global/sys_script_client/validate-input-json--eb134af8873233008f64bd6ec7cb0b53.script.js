function onSubmit() {
	g_form.clearMessages();
	var defaultDataString = g_form.getValue("default_data_template");
	var dynamicDataSchema = g_form.getValue("dynamic_data_schema");
	
	var defaultJSON = null;
	try{
		defaultJSON = JSON.parse(defaultDataString);
	}catch(err){
		g_form.addErrorMessage(getMessage("The default data template is not a valid JSON."));
		return false;
	}
	
	if (!defaultJSON.credential) {
		g_form.addErrorMessage(getMessage("The default data template is not valid. Default credential data is mandatory."));
		return false;
	}
	
	if (!defaultJSON.connection) {
		g_form.addErrorMessage(getMessage("The default data template is not valid. Default connection data is mandatory."));
		return false;
	}
	
	try{
		JSON.parse(dynamicDataSchema);
	}catch(err){
		g_form.addErrorMessage(getMessage("The dynamic data schema is not a valid JSON."));
		return false;
	}
	return true;
   
}
