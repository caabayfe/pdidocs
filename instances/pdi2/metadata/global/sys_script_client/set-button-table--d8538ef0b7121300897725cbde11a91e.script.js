function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '')
		return;
	
	var getButtonTable = new GlideAjax('GetButtonTable');
	getButtonTable.addParam('sysparm_name', 'getButtonTableName');
	getButtonTable.addParam('sysparm_button_id', g_form.getValue('button'));
	getButtonTable.getXML(populateButtonTable);

	function populateButtonTable(response) {
		var tableNameFromScriptInclude = response.responseXML.documentElement.getAttribute("answer");
		if (tableNameFromScriptInclude && tableNameFromScriptInclude.length > 0)
			g_form.setValue('button_table', tableNameFromScriptInclude);	
	}
}
