(function executeRule(current, previous /*null when async*/) {
	var cxsDSU = new cxs_DefSearcherUtils(current);
	var aDefResGr = cxsDSU.getDefaultAdditionalResources();
	var sResGr = cxsDSU.getSearcherResources();
	
	// Quick check of more than one searcher resource
	var multiSR = sResGr.next() && sResGr.next();
	var searcherDefault = (!current.cxs_searcher_config.nil() && !aDefResGr.next()) || current.isNewRecord();
	
	g_scratchpad.cxs = {
		"searcher_default": searcherDefault,
		"show_searcher_resource": searcherDefault && multiSR
	};
	
	// We don't want to add a message for new records.
	if (current.isNewRecord())
		return;
	
	var messageParams = null;
	if (searcherDefault) {
		if (current.default_searcher_resource.nil() || current.getValue("default_searcher_resource") === "all") {
			messageParams = multiSR ? [gs.getMessage("All")] : [sResGr.getDisplayValue("label")];
		}
		else {
			var searcherResource = new GlideRecord("cxs_search_res_config");
			if (searcherResource.get(current.getValue("default_searcher_resource")))
				messageParams = [searcherResource.getDisplayValue("label")];
		}

		if (messageParams !== null)
			gs.addInfoMessage(gs.getMessage("Default search source is the Searcher Resource '{0}'", messageParams));
	}
	else if (!current.cxs_searcher_config.nil())
		gs.addInfoMessage(gs.getMessage("Default search source is the Additional Resource '{0}'",[aDefResGr.getDisplayValue()]));

})(current, previous);
