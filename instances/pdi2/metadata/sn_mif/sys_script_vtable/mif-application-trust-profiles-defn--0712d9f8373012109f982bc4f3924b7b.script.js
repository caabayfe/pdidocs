(function executeQuery(v_table, v_query) {
	var gr = new GlideAggregate("sn_mif_capability");
	gr.addNotNullQuery("application.name");
	gr.groupBy("application");
	gr.query();
	while (gr.next()) {
		var appId = gr.getValue("application");
		v_table.addRow({
			sys_id: appId,
			application: appId,
			description: "Trust Profile for " + gr.getValue("application.name")
		});
	}
  })(v_table, v_query);
