(function executeRule(current, previous /*null when async*/) {

	var tracker = new GlideRecord("sys_execution_tracker");
	tracker.addQuery("source", current.sys_id);
	tracker.addQuery("source_table", "sys_update_set_source");
	tracker.orderByDesc("sys_created_on");
	tracker.query();
	if (tracker.next()) {
		g_scratchpad.update_source_tracker_id = tracker.sys_id;
		g_scratchpad.update_source_tracker_created_on = tracker.sys_created_on;
	}

})(current, previous);
