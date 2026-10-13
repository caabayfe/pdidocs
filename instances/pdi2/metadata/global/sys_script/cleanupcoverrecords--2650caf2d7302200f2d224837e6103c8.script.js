(function executeRule(current, previous /*null when async*/) {
	if (JSUtil.nil(current.sys_id))
		return;
	var gr = new GlideRecord("roster_schedule_span");
	gr.addQuery("roster", current.sys_id);
	gr.query();
	gr.deleteMultiple();
})(current, previous);
