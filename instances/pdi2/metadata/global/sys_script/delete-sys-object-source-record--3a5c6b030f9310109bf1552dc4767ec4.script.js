(function executeRule(current, previous /*null when async*/) {
	
	// Delete sys object source if target_sys_id = sys id
	var gr = new GlideRecord("sys_object_source");
	gr.addQuery("target_sys_id", current.sys_id);
	gr.deleteMultiple();
	
})(current, previous);
