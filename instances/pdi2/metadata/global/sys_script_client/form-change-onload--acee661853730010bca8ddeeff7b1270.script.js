function onLoad() {
	if (!g_form.isNewRecord()) {
		g_form.setReadOnly('type', true);
		g_form.setReadOnly('derived', true);
		var type = g_form.getValue('type');
		var derived = g_form.getBooleanValue('derived');
		var x = new GwtMessage();
		if (type == 'SPELLCHECK' || (type == 'AUTOCOMPLETE' && derived)) {
			g_form.setMandatory('data_source', true);
			g_form.setMandatory('field', true);
			g_form.showFieldMsg('field', x.getMessage('comma separated list of fields, e.g. title,kb_knowledge.short_description'), 'info', true);
			g_form.showFieldMsg('auto_refresh', x.getMessage('Auto refresh interval in hour, minimum 24'), 'info', true);
		}
	} else {
		g_form.setDisplay('derived', false);
		g_form.setSectionDisplay('derive_settings', false);
		g_form.setMandatory('data_source', false);
		g_form.setMandatory('field', false);
	}
	g_form.setDisplay('locale', type != 'SPELLCHECK');
}
