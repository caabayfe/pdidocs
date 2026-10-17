(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.remote_base_update_set = current.remote_base_update_set.sys_id;
	g_scratchpad.remote_base_update_set_name = current.remote_base_update_set.name;
})(current, previous);
