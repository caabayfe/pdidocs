function onLoad() {
	if (g_form.isNewRecord() || g_form.getValue('search_engine') === 'zing') return;
	
   //Call script includes to check if valid Facet Field name
	var ga = new GlideAjax('ValidateFacets');
	ga.addParam('sysparm_name', 'validate_existing_records');
	ga.addParam('sysparm_search_profile', g_form.getValue('search_profile'));
	ga.addParam('sysparm_search_config', g_form.getUniqueValue());
	ga.getXMLAnswer(update);
	
	function update(answer) {
		var invalidFacets = JSON.parse(answer);
		
		//Display warning if any invalid facets
		if (invalidFacets.length > 0) {
			g_form.addErrorMessage(getMessage("Warning. The following search facets are invalid. Please either remove the facet record or update the search sources in the Search Profile to include the table these facets are mapped to."));
			g_form.addErrorMessage(answer.slice(1, answer.length-1).replaceAll(/",/g, "\", "));
		}
		
		return;
	}
	
   
}
