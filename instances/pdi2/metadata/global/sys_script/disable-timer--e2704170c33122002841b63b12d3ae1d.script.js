(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_flow_trigger_auto_script");
	gr.query("trigger", current.sys_id);
	if (gr.next())
		gr.deleteRecord();

})(current, previous);
