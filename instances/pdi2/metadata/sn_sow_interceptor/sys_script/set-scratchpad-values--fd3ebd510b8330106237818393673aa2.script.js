(function executeRule(current, previous /*null when async*/) {
	var utils = new sn_sow_interceptor.InterceptorUtils();
	g_scratchpad.target_table_choices = utils.getTableHierarchy();

})(current, previous);
