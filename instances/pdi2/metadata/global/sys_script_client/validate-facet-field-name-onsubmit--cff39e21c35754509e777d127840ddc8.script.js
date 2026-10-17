function onSubmit() {
	var facet_field = g_form.getValue('ais_facet_name');
   //Get Search Profile sys_id
	var config_id = g_form.getValue('search_context_config');	
	var gr = new GlideRecord('sys_search_context_config');
	gr.get(config_id);
	var profile_id = gr.search_profile;

	
   //Call script includes to check if valid Facet Field name
	var ga = new GlideAjax('ValidateFacets');
	ga.addParam('sysparm_name', 'validate_facet_field');
	ga.addParam('sysparm_facet_field', facet_field);
	ga.addParam('sysparm_search_profile', profile_id);
	ga.getXMLWait();
	
	var answer = ga.getAnswer();
	if (answer !== "valid") {
		g_form.flash("ais_facet_name", "#FFDADC", 0);
		return false;
	}
	return true;
}
