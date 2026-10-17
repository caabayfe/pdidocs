function onCondition() {
	if (g_form.getValue('applies_to') == '1')
		return;
	
	var gr = new GlideRecord('ts_index_name');
	gr.addQuery('table', g_form.getValue('table'));
	gr.query();
	if (gr.next()) {
		g_form.setReadOnly('format', true);
	}
}
