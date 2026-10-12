function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var ga = new GlideAjax("ExportDefinitionHelper");
	ga.addParam("sysparm_name", "getFieldsCS");
	
	ga.addParam("sysparm_table_name", newValue);
	ga.addParam("sysparm_view_name", '');
	ga.getXMLWait();
	
	var defaultViewFields = ga.getAnswer();
	if (defaultViewFields) {
		g_form.setValue('field_list', defaultViewFields);
	}	
}
