function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (g_scratchpad.isWebServiceBR) {
		var brTable = g_form.getValue('collection');
		var restService = g_form.getDisplayBox('rest_service').value;
		var restMethod = g_form.getDisplayBox('rest_method').value;
		
		businessRuleREST.onLoadVariableFormatter(brTable, restService, restMethod);
	}
}
