function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '')
      return;
 
	var extendedTables = new GlideAjax('InheritedTablesUtilsExtended');
	extendedTables.disableRunInBatch();
	var screenRecordId = g_form.getValue('screen');
	extendedTables.addParam('sysparm_name','getInheritedTables');
	extendedTables.addParam('sysparm_screen', screenRecordId);
	extendedTables.getXML(populateTableChoiceField);
    
	function populateTableChoiceField(response) {
		var resultFromScriptInclude = response.responseXML.documentElement.getAttribute("answer");
		if (resultFromScriptInclude != null) {
			var previousValue = g_form.getValue("table");
			g_form.clearOptions("table");
			var res = JSON.parse(resultFromScriptInclude);
			if (res == null)
				return;

			var isPrevValueExist = false;
			for (var i = 0; i < res.size(); i++) {
				if(res[i].table_name === previousValue)
					isPrevValueExist = true;

				g_form.addOption('table', res[i].table_name, res[i].label);	
			}

			if (isPrevValueExist)
				g_form.setValue("table", previousValue);
		}
	}
}
