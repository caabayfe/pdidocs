(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('Configuration of manual CI class exclusions / inclusions from sys_properties is deprecated. Please use the following table: {0}', '<a href="/svc_manual_ci_exclusions_inclusions_list.do" target="_blank">svc_manual_ci_exclusions_inclusions</a>'));

})(current, previous);
