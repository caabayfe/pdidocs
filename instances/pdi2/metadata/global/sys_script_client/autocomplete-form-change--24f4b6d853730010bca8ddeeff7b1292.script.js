function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var type = g_form.getValue('type');
	if (type == 'AUTOCOMPLETE') {
		var x = new GwtMessage();
		if (newValue == 'true') {
			g_form.setSectionDisplay('derive_settings', true);
			g_form.setMandatory('data_source', true);
			g_form.setMandatory('field', true);
			g_form.hideAllFieldMsgs();
			g_form.showFieldMsg('field', x.getMessage('comma separated list of fields, e.g. title,kb_knowledge.short_description'), 'info', true);
			g_form.showFieldMsg('auto_refresh', x.getMessage('Auto refresh interval in hour, minimum 24'), 'info', true);
		} else {
			g_form.setMandatory('data_source', false);
			g_form.setMandatory('field', false);
			g_form.setSectionDisplay('derive_settings', false);
		}
	}
}
