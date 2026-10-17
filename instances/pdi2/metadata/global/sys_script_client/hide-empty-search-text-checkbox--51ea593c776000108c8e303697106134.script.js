function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	var ajax = new GlideAjax('cxs_Utils');
	ajax.addParam('sysparm_name', 'hasAddlResourcesAJAX');
	ajax.addParam('sysparam_context_config_id', g_form.getValue('cxs_context_config'));
	ajax.getXML(showField);

	function showField(response) {
		if (response) {
			var hasAddlRes = response.responseXML.documentElement.getAttribute("answer");

			if (hasAddlRes === 'false') {
				g_form.setValue('allow_empty_search_term', false);
				g_form.setVisible('allow_empty_search_term', false);
			} else if (hasAddlRes === 'true') {
				g_form.setVisible('allow_empty_search_term', true);
			}
		}
	}
}
