function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (hasStageField( g_form.getValue("table") ))
		g_form.setSectionDisplay("stages", true);
	else
		g_form.setSectionDisplay("stages", false);
	
	function hasStageField(tableName) {
		var ga = new GlideAjax('WorkflowVersionUtils');
		ga.addParam('sysparm_name', 'hasStageField');
		ga.addParam('sysparm_table', tableName+'');
		ga.getXMLWait();
		var answer = ga.getAnswer();
		return answer == 'true';
	}
}
