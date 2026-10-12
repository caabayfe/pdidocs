(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_user");
	gr.addQuery("user_name", current.sys_created_by);
	gr.query();
	if (gr.next()) {
		current.opened_by = gr.getUniqueValue();
	}
})(current, previous);
