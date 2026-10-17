(function executeRule(current, previous /*null when async*/) {

	var tracker = new GlideRecord("sys_execution_tracker");
	tracker.addQuery("source_table", "sys_remote_update_set");
	tracker.addQuery("source", current.sys_id);
	tracker.orderByDesc("sys_created_on");
	tracker.query();
	if (!tracker.next())
		return;
	
	if (tracker.state == "0") //pending
		gs.addInfoMessage(gs.getMessage("There is a pending operation on this update set: {0}", tracker.name));
	else if (tracker.state == "1") //running
		gs.addInfoMessage(gs.getMessage("There is an active operation running on this update set: {0}", tracker.name));

})(current, previous);
