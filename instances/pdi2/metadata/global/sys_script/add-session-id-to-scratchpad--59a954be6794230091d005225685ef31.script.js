(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.session_id = new GlideChecksum(gs.getSessionID()).getMD5();

	// Add your code here

})(current, previous);
