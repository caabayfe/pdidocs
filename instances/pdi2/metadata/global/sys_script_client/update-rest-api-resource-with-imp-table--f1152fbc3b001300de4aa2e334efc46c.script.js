function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var rest_api_resource = g_form.getValue('rest_api_resource');
	if(rest_api_resource){
		if(g_scratchpad.oldImportSetTableVal)
			rest_api_resource = rest_api_resource.replace(g_scratchpad.oldImportSetTableVal, newValue);
		else if(oldValue)
			rest_api_resource = rest_api_resource.replace(oldValue, newValue);
		else
			rest_api_resource = rest_api_resource.replace('{stagingTableName}', newValue);
		
		g_form.setValue("rest_api_resource", rest_api_resource);
		//Since oldValue parameter is only populated when form is loaded, 
		//this keeps track of value when field changes but form is not reloaded  
		g_scratchpad.oldImportSetTableVal = newValue;
	}
}
