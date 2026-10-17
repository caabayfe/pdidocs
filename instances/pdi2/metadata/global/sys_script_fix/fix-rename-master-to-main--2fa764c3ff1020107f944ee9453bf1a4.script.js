(function () {
	var sgr = new GlideRecord("sys_dictionary");
	sgr.addQuery("name", "sys_hub_flow");
	sgr.addQuery("element", "master_snapshot");
	sgr.query();
	if (sgr.next()) {
		sgr.column_label = "Main snapshot";
		sgr.setWorkflow(false);
		sgr.update();
	}
	sgr = new GlideRecord("sys_dictionary");
	sgr.addQuery("name", "sys_hub_action_type_definition");
	sgr.addQuery("element", "master_snapshot");
	sgr.query();
	if (sgr.next()) {
		sgr.column_label = "Main snapshot";
		sgr.setWorkflow(false);
		sgr.update();
	}
	sgr = new GlideRecord("sys_dictionary");
	sgr.addQuery("name", "sys_hub_flow_snapshot");
	sgr.addQuery("element", "master");
	sgr.query();
	if (sgr.next()) {
		sgr.column_label = "Main";
		sgr.setWorkflow(false);
		sgr.update();
	}
	sgr = new GlideRecord("sys_dictionary");
	sgr.addQuery("name", "sys_hub_action_type_snapshot");
	sgr.addQuery("element", "master");
	sgr.query();
	if (sgr.next()) {
		sgr.column_label = "Main";
		sgr.setWorkflow(false);
		sgr.update();
	}
})();
