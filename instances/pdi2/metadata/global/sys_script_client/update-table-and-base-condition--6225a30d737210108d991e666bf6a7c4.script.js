function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var datasourceId = g_form.getValue('datasource');
	if (!datasourceId) return;
	
	g_form.setValue('condition', '');
	
	var ga = new GlideAjax('EVAMUtilsAjax');
	ga.addParam('sysparm_name', 'getDatasourceTableAndCondition');
	ga.addParam('sysparm_sys_id', datasourceId);
	ga.getXML(function(response) {
		var answer = JSON.parse(response.responseXML.documentElement.getAttribute('answer').toString());
		g_form.setValue('datasource_table', answer.table);
		g_form.setValue('base_condition', answer.condition);
	});
   
}
