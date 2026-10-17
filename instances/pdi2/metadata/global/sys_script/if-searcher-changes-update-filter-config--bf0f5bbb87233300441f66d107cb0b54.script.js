(function executeRule(current, previous /*null when async*/) {
	// Note: this business rule must be executed after Search Context record gets updated!
	
	var oldSearcherSysId = previous.getValue("cxs_searcher_config");
	var newSearcherSysId = current.getValue("cxs_searcher_config");
	var cxs_FltrConfig = new global.cxs_FltrConfig();
	
	// If searcher previously was empty, then just return.
	if (gs.nil(oldSearcherSysId))
		return;
	
	// Update Resource Configuration of Filter Configurations because corresponding Searcher has changed.
	cxs_FltrConfig._updateResConfigAfterSearcherChanged(oldSearcherSysId, newSearcherSysId, current.getUniqueValue(), "cxs_table_fltr_config", "cxs_table_config");
	cxs_FltrConfig._updateResConfigAfterSearcherChanged(oldSearcherSysId, newSearcherSysId, current.getUniqueValue(), "cxs_rp_fltr_config", "cxs_rp_config");
})(current, previous);
