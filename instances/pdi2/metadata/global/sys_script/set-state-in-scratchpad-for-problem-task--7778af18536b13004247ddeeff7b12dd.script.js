(function executeRule(current, previous /*null when async*/) {
	
	g_scratchpad.PRBTASK_STATES = new ProblemTaskState().getProblemTaskState();

	g_scratchpad.originalState = current.state;
	g_scratchpad.originalCloseCode = current.close_code;
})(current, previous);
