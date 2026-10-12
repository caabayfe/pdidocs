updateColumnType("sys_cs_one_extend_invocation" , ["inputs", "outputs", "output_topic_vars"]);
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
