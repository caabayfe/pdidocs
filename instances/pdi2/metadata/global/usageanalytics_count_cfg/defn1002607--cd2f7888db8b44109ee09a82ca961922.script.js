if (GlidePluginManager.isActive("com.glideapp.itom.snac")) {

	var rowCount = 0;
	var gr = new GlideRecord('cmdb_ci_service_discovered');
	if (gr.isValid()) {
		gr.addQuery('operational_status', '1');
		gr.query();
		if (gr.next())
			rowCount = gr.getRowCount();
	}
	answer = rowCount;
}
else {
	answer = 0;
}
