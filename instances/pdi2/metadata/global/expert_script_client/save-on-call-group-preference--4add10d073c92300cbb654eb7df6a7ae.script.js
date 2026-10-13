function onSubmit() {
	var iframe = gel('on-call-group-preference');
	
	if (iframe.contentWindow.location.href.indexOf('on_call_group_preference.do') !=-1 && iframe.contentWindow.g_form) {
		var preferencesGform = iframe.contentWindow.g_form;
		g_form.setValue('group_preferences_modified', preferencesGform.modified + '');
		if (preferencesGform.modified) {
			g_form.setValue('rota_managers', preferencesGform.getValue('rota_managers'));
			g_form.setValue('pto_approval_config', preferencesGform.getValue('pto_approval_config'));
			g_form.setValue('allow_rota_overlap', preferencesGform.getValue('allow_rota_overlap'));
			g_form.setValue('escalation_rule_rota_overlap', preferencesGform.getValue('escalation_rule_rota_overlap'));
		}
	}
	
	iframe.remove(); // prevent showing 'leaving page' alert message, on form changes.
	
	return true;
}
