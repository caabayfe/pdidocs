function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	var conn = g_form.getReference('connector_definition');
	if (conn.bi_directional == 'true') {
		g_form.setDisplay('bi_directional', true);
	} else {
		g_form.setValue('bi_directional', false);
		g_form.setDisplay('bi_directional', false);
	}

	if (conn.kpi == 'true') {
		g_form.setDisplay('kpi', true);
	} else {
		g_form.setValue('kpi', false);
		g_form.setDisplay('kpi', false);
	}

	// hide Host IP field if the connector definition is equal to KafkaConsumer_JS
	// user provides the Host IP in the bootstrap_servers field of the em_connector_instance_value as IP1:port1,IP2:port2
	if (g_form.getValue('connector_definition') == "f3999e7f47f34d10ee9acc48946d43fc") {
	    g_form.setMandatory('host', false);
	    g_form.setDisplay('host', false);
	}

}
