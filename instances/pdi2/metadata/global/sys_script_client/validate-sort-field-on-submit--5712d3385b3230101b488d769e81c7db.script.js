function onSubmit() {
	var sortField = g_form.getValue('ais_field_name');
	
	var config_id = g_form.getValue('search_context_config');	
	var gr = new GlideRecord('sys_search_context_config');
	gr.get(config_id);
	var profileID = gr.search_profile;

	var ga = new GlideAjax('ValidateSortOption');
	ga.addParam('sysparm_name', 'validateSortField');
	ga.addParam('sysparm_sort_field', sortField);
	ga.addParam('sysparm_search_profile', profileID);
	ga.getXMLWait();

	var answer = ga.getAnswer();
	if (answer !== "valid") {
		g_form.flash("ais_field_name", "#FFDADC", 0);
		return false;
	}
	return true;
}
