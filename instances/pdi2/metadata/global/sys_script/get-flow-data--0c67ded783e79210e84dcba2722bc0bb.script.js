(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.flowData = new ChgMgtConflictWorker(null, current.getUniqueValue()).getFlowData();

})(current, previous);
