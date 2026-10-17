function onLoad() {
	if (g_form.isNewRecord() || g_form.getValue('search_engine') === 'zing') return;

	var invalidRecords = [];
	var sortOptionGR = new GlideRecord("sys_search_sort_option");
	sortOptionGR.addQuery("search_context_config", g_form.getUniqueValue());
	sortOptionGR.query();
	while (sortOptionGR.next()) {
		var ga = new GlideAjax('ValidateSortOption');
		ga.addParam('sysparm_name', 'validateSortField');
		ga.addParam('sysparm_search_profile', g_form.getValue('search_profile'));
		ga.addParam('sysparm_sort_field', sortOptionGR.getValue("ais_field_name"));
		ga.getXMLWait();
		if (ga.getAnswer() !== "valid") invalidRecords.push(sortOptionGR.getValue("gui_label"));
	}

	if (invalidRecords.length > 0) {
		var invalidRecordsString = JSON.stringify(invalidRecords);
		invalidRecordsString = invalidRecordsString.slice(1, invalidRecordsString.length-1).replaceAll(/",/g, "\", ");
		g_form.addErrorMessage(getMessage("Warning. The following sort options are invalid. Please either remove the sort option record or update the search sources in the Search Profile to include the table(s) by whose fields these records would sort."));
		g_form.addErrorMessage(invalidRecordsString);
	}
}
