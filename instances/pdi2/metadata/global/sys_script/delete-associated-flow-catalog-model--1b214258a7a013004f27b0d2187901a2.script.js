(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_flow_cat_variable_model");
	gr.addQuery("id", current.sys_id);
	gr.query();
	if (gr.next())
		gr.deleteRecord();
})(current, previous);
