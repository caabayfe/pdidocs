(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.flowData = new ChangeFlowUtil(current).getFlowData();

})(current, previous);
