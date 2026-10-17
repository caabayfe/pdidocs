function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

	var getScreenDataItemTable = new GlideAjax('GetScreenDataItemTable');
	getScreenDataItemTable.addParam('sysparm_name', 'getTableName');
	getScreenDataItemTable.addParam('sysparm_screen_id', g_form.getValue('screen'));
	getScreenDataItemTable.getXML(populateScreenDataItemTable);

	function populateScreenDataItemTable(response) {
		var tableNameFromScriptInclude = response.responseXML.documentElement.getAttribute("answer");
		if (tableNameFromScriptInclude && tableNameFromScriptInclude.length > 0)
			g_form.setValue('screen_data_item_table', tableNameFromScriptInclude);	
	}
}
