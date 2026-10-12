(function() {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("table", "license_details");
	gr.addQuery("element", "expired");
	gr.query();
	if (gr.next()) {
		gr.setValue("choice", 3);
		gr.setValue("column_label", "Status");
		gr.update();
	}
})();
