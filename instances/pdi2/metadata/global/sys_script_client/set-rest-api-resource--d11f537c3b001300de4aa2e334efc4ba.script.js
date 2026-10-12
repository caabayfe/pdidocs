function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var pattern = new RegExp("now(\/v[0-9]+)?\/(table|import|stats)\/");
	var rest_api_resource = newValue;
	if(pattern.test(newValue)){
		if(newValue.indexOf('/import/') > 0){
			var importTable = g_form.getValue('import_set_table');
			if(importTable)
				rest_api_resource = newValue.replace('{stagingTableName}',importTable);
		} else {
			var tableValue = g_form.getValue('table');
			if(tableValue)
				rest_api_resource = newValue.replace('{tableName}',tableValue);
		}
	} 
	
	g_form.setValue("rest_api_resource", rest_api_resource);
}
