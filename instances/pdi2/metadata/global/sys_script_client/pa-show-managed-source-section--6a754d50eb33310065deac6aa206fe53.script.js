function onLoad() {
	var showSection = g_form.getValue('managing_indicator');
	if (!showSection && !g_form.getBooleanValue('has_managed_indicators')) {
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'com.snc.pa.managed_sources');
        gr.query();
        if (gr.next())
            showSection = gr.getValue('value') === 'true';
	}
    g_form.setSectionDisplay('managed_source', showSection);
}
