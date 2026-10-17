function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '')
      return;
	
	var relatedLists = new GlideAjax('GetRelatedListsForTable');
	var tableName = g_form.getValue('table_related_to');
	relatedLists.addParam('sysparm_name','getRelatedLists');
	relatedLists.addParam('sysparm_table_name', tableName);
	relatedLists.getXML(populateRelatedListsChoices);
	
	function populateRelatedListsChoices(response) {
		var relatedListsJSON = response.responseXML.documentElement.getAttribute("answer");
		if (relatedListsJSON == null)
			return;
		
		var previousValue = g_form.getValue("relationship");
		g_form.clearOptions("relationship");
		var relatedListsArray = JSON.parse(relatedListsJSON);
		if (relatedListsArray == null || relatedListsArray.size() < 1)
			return;

		var doesPrevValueExist = false;
		for (var i = 0; i < relatedListsArray.size(); i++) {
			if(relatedListsArray[i].relationship === previousValue)
				doesPrevValueExist = true;

			g_form.addOption('relationship', relatedListsArray[i].relationship, relatedListsArray[i].label);	
		}

		if (doesPrevValueExist)
			g_form.setValue("relationship", previousValue);
	}   
}
