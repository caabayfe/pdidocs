updateColumnType("one_api_service_plan_feature_invocation" , ["raw_input","input","raw_output","output"]);
updateColumnType("one_api_service_plan_invocation" , ["input", "output", "execution_plan"]);

function updateColumnType(tableName, elements) {
	for (var i = 0; i < elements.length; i++) {
		var gr = new GlideRecord("sys_dictionary");
		gr.addQuery("name", tableName);
		gr.addQuery("element", elements[i]);
		gr.query();
		if (gr.next()) {
			gr.setValue("internal_type", "string");
			gr.update();
		}
	}
}
