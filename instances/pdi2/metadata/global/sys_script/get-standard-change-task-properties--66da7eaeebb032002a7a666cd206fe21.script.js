(function executeRule(current, previous /*null when async*/) {

	var stdChgTaskUtils = new StdChangeTaskUtils();
	g_scratchpad.std_chg_task_props = stdChgTaskUtils.getFieldsConfig();
	g_scratchpad.is_template_readonly = !stdChgTaskUtils.canModifyTemplate(current);

})(current, previous);
