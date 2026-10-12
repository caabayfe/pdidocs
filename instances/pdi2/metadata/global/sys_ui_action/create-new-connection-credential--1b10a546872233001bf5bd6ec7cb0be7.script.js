function doProcess(){
	g_form.clearMessages();

	var templateSysID = g_form.getValue("configuration_template");
	if(!templateSysID){
		g_form.addErrorMessage(getMessage("There is no configuration template to create connections and credential records."));
		return false;
	}
	
	var configTemplateGR = g_form.getReference("configuration_template");
	var defaultData = configTemplateGR.getValue("default_data_template");
	var defaultDataJSON;
	try{
		defaultDataJSON = JSON.parse(defaultData);
	}catch(err){
		g_form.addErrorMessage(getMessage("The default data from configuration template is not a valid JSON."));
		return false;
	}
	
	var dynamicDataSchema = configTemplateGR.getValue("dynamic_data_schema");
	var dynamicDataSchemaJSON;
	try{
		dynamicDataSchemaJSON = JSON.parse(dynamicDataSchema);
	}catch(err){
		g_form.addErrorMessage(getMessage("The dynamic data schema from configuration template is not a valid JSON."));
		return false;
	}
	
	var gm = new GlideModal("create_connection_and_credential_dialog", false, 500, 300);
	gm.setTitle(getMessage("Create Connection and Credential"));
	gm.setPreference("focusTrap", "enable");
	gm.setPreference("credentialTable", defaultDataJSON.credential.table);
	gm.setPreference("dynamicDataSchema", dynamicDataSchema);
	gm.setPreference("dynamicDataSchemaJSON", dynamicDataSchemaJSON);
	gm.setPreference("connectionAliasSysID", g_form.getUniqueValue());
	gm.setBackdropStatic(true);
	gm.render();
}
