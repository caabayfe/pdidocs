(function executeRule(current, previous /*null when async*/) {
	var itemConfig = new sn_ex_sp.ActivityConfigurationUtil();
	g_scratchpad.isConfigExists = itemConfig.isActivityConfigDetailPresent(current.sys_id);

})(current, previous);
