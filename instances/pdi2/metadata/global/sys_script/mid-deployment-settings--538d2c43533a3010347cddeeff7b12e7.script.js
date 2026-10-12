(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.mid_deployment_max_mid_quantity = gs.getProperty('mid.deployment.max_mid_quantity', 10);
})(current, previous);
