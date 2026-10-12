(function executeRule(current, previous /*null when async*/) {
	var cxsUiActConfigUtil = new cxs_UIActionConfig();
	cxsUiActConfigUtil.updateAddUACFromResourceContext(current, true);
})(current, previous);
