function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var gr = new GlideRecord('ts_index_name');
	gr.addQuery('table', g_form.getValue('table'));
	gr.query();
	if (gr.next()) {
		g_form.setValue('format', gr.getValue('format'), gr.getValue('format'));
		g_form.setReadOnly('format', true);
	} else
		g_form.setReadOnly('format', false);
}
