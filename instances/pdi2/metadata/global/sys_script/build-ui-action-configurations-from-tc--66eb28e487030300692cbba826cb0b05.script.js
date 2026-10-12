(function executeRule(current, previous /*null when async*/) {
	var cxsUiActConfigUtil = new cxs_UIActionConfig();
	
	// If it is an update operation and search context is not changed, just return
	if (previous != null && current.getValue('cxs_context_config') == previous.getValue('cxs_context_config'))
		return;
	
	// If it is an update operation and context's searcher is not changed, we only update additional ui action config
	if (previous != null && !!previous.cxs_context_config && current.cxs_context_config.cxs_searcher_config == previous.cxs_context_config.cxs_searcher_config) {
		cxsUiActConfigUtil.buildAddUACFromTableConfig(current);
		return;
	}
	
	// Else, build both additional/non-additional ui action configs
	cxsUiActConfigUtil.buildUACFromTableConfig(current);
	cxsUiActConfigUtil.buildAddUACFromTableConfig(current);
})(current, previous);
