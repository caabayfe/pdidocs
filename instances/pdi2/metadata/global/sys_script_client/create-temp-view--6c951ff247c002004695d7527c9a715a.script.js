function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	var ga = new GlideAjax("ExportDefinitionHelper");
	ga.addParam("sysparm_name", "createTmpViewED");
	ga.addParam("sysparm_field_list", g_form.getValue('field_list'));
	ga.addParam("sysparm_table_name", g_form.getValue('table_name'));
	ga.getXMLWait();
	var view = ga.getAnswer();
	if (view) {
		g_scratchpad.view = view;
	}	
}
