updateColumnLabel("sys_cs_one_extend_invocation" , "session_context");
    updateColumnLabel("sys_cs_one_api_call_log" , "session_context");
function updateColumnLabel(tableName, element) {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", tableName);
	gr.addQuery("element", element);
	gr.query();
	if (gr.next()) {
		gr.setValue("column_label", "Deprecated One Api Glide Session Context");
		gr.update();
	}
}
