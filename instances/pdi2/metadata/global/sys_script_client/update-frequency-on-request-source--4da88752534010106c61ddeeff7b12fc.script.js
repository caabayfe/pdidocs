function onLoad() {
	var gr = new GlideRecord('ml_capability_definition_base');
	gr.addQuery('sys_id', g_form.getUniqueValue());
	gr.query();
	if (gr.next()) {
		var source = gr.getValue('request_source').toUpperCase();
		if(source != "API") {
		   g_form.removeOption('update_frequency', 'every_1_minute');
		}
	} else {
		g_form.removeOption('update_frequency', 'every_1_minute');
	}
}
