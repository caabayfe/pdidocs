(function executeRule(current, previous /*null when async*/) {
	if (current.getValue('cxs_searcher_config') == previous.getValue('cxs_searcher_config'))
		return;
	
	var cxsUiActConfigUtil = new cxs_UIActionConfig();
	cxsUiActConfigUtil.buildUACFromSearchContext(current);
})(current, previous);
