(function () {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sys_flow_execution_setting");
	gr.addQuery("element", "reporting");
	gr.query();
	if (gr.next()) {
		gr.default_value = "";
		gr.update();
	}
})();
