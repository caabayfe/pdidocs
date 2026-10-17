function onLoad() {
	var dataSourceTemplate = "(function DataSource(valuesMapper, context) {\n//Type appropriate comment here, and begin script below\n\n})(valuesMapper, context);";
	var script = g_form.getValue("script");
	if (script != '')
		return;
	
	g_form.setValue('script', dataSourceTemplate);	
}
