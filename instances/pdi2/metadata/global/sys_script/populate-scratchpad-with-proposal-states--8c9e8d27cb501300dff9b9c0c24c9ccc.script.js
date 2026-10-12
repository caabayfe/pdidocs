(function executeRule(current, previous /*null when async*/) {
	var stdChangeUtils = new StdChangeUtils();

	g_scratchpad.states = {
		"NEW": stdChangeUtils.STATE_NEW,
		"WIP": stdChangeUtils.STATE_WIP,
		"CLOSED": stdChangeUtils.STATE_CLOSED,
		"CANCELLED": stdChangeUtils.STATE_CANCELLED
	};
})(current, previous);
