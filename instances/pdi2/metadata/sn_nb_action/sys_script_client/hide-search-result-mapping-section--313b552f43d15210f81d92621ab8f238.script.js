function onLoad() {
	var searchApplicationConfiguration = g_form.getValue("search_application_configuration");
	if(searchApplicationConfiguration == ""){
		g_form.hideRelatedList('sn_nb_action_search_result_ra_mapping');
	}
}
