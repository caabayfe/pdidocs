function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '')
		return;

	var getRelatedListsScreenParentTable = new GlideAjax('GetRelatedListsScreenParentTable');
	getRelatedListsScreenParentTable.addParam('sysparm_name', 'getTableName');
	getRelatedListsScreenParentTable.addParam('sysparm_related_lists_screen_parent_id', g_form.getValue("parent"));
	getRelatedListsScreenParentTable.addParam('sysparm_related_lists_screen_parent_table', g_form.getValue("parent_table"));
	getRelatedListsScreenParentTable.getXML(populateRelatedListsScreenTable);

	function populateRelatedListsScreenTable(response) {
		var tableNameFromScriptInclude = response.responseXML.documentElement.getAttribute("answer");
		if (tableNameFromScriptInclude && tableNameFromScriptInclude.length > 0)
			g_form.setValue('table', tableNameFromScriptInclude);	
	}
}
