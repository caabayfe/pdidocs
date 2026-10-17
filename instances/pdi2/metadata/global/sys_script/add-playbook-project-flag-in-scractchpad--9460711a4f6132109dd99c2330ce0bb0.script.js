(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.isPlaybookProject = new ProminACLUtilSNC(current).isPlaybookProject();
})(current, previous);
