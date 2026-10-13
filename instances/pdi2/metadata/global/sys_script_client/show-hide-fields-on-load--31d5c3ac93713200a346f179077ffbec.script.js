function onLoad() {
	var conn = g_form.getReference('connector_definition');
	if (conn.bi_directional == 'true') {
		g_form.setDisplay('bi_directional', true);
	} else {
		g_form.setDisplay('bi_directional', false);
	}
	
	var displayKbi =false;
	if (conn.kpi == 'true' ) {
		var ga = new GlideAjax('ExistingTable') ;
		ga.addParam('sysparm_name','isExistingTable');
		ga.addParam('sysparm_table_name', "sa_metric_map");
		ga.getXMLWait();
		if (ga.getAnswer() == 'true'){
			displayKbi =true;
		}
	}
	g_form.setDisplay('kpi', displayKbi);

  // hide Host IP field if the connector definition is equal to KafkaConsumer_JS
	// user provides the Host IP in the bootstrap_servers field of the em_connector_instance_value as IP1:port1,IP2:port2
	if (g_form.getValue('connector_definition') == "f3999e7f47f34d10ee9acc48946d43fc") {
	    g_form.setMandatory('host', false);
	    g_form.setDisplay('host', false);
	}
	
	// Show / hide assignment group field based on system property 'evt_mgmt.connector_enable_assignment_group_support'
	g_form.setDisplay('assignment_group', g_scratchpad.assignmentGroupSupportEnabled);

}
