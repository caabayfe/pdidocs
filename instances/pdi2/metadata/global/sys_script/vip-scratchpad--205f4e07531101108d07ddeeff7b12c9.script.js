(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.is_vip = false;
	if (!current.assigned_to.nil()) {
		g_scratchpad.is_vip = current.assigned_to.vip; 
	}

})(current, previous);
