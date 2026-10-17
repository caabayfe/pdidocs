function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
	var saveAndClose = true;
	var sortOption = new GlideRecord(table);
	sortOption.get(sysIDs[0]);
	var applicationID = sortOption.getValue("search_context_config");
	var application = new GlideRecord("sys_search_context_config");
	application.get(applicationID);
	var searchProfile = application.getValue("search_profile");
	//Call script includes to check if valid Facet Field name
	var ga = new GlideAjax('ValidateSortOption');
	ga.addParam('sysparm_name', 'validateSortField');
	ga.addParam('sysparm_sort_field', newValue);
	ga.addParam('sysparm_search_profile', searchProfile);
	ga.getXMLAnswer((updateField));
	
	function updateField (answer) {
		callback(answer === "valid");
	}
}
