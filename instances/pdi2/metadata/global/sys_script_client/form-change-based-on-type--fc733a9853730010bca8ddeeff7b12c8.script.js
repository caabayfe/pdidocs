function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	if (g_form.isNewRecord()) {
		var type = g_form.getValue('type');
		var x = new GwtMessage();
		switch (type) {
			case 'SYNONYM':
			case 'STOPWORD':
				g_form.setDisplay('derived', false);
				g_form.setMandatory('data_source', false);
				g_form.setMandatory('field', false);
				g_form.setSectionDisplay('derive_settings', false);
				break;
			case 'SPELLCHECK':
				g_form.setValue('derived', true, true);
				g_form.setReadOnly('derived', true);
				g_form.setDisplay('derived', true);
				g_form.setSectionDisplay('derive_settings', true);
				g_form.setMandatory('data_source', true);
				g_form.setMandatory('field', true);
				g_form.hideAllFieldMsgs();
				g_form.showFieldMsg('field', x.getMessage('comma separated list of fields, e.g. title,kb_knowledge.short_description'), 'info', true);
				g_form.showFieldMsg('auto_refresh', x.getMessage('Auto refresh interval in hour, minimum 24'), 'info', true);
				break;
			case 'AUTOCOMPLETE':
				g_form.setValue('derived', false);
				g_form.setReadOnly('derived', false);
				g_form.setDisplay('derived', true);
				g_form.setMandatory('data_source', false);
				g_form.setMandatory('field', false);
				g_form.setSectionDisplay('derive_settings', false);
				break;
		}
	}
	g_form.setDisplay('locale', type != 'SPELLCHECK');
}
