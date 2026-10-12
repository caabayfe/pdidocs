(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.isMiningJobActive = new global.ProminACLUtil(current).isMiningJobActive();
})(current, previous);
