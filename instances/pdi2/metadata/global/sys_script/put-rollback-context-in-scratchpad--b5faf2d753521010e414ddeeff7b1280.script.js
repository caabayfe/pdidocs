(function executeRule(current, previous /*null when async*/) {
	if (current.state == 'complete' || current.state == 'cancelled') {
		g_scratchpad.rollback_context = current.getValue("rollback_context");
	}
})(current, previous);
