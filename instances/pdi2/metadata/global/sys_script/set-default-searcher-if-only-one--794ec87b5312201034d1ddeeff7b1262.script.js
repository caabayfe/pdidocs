(function executeRule(current, previous /*null when async*/) {
	var searcherResource = new GlideRecord("cxs_search_res_config");
	searcherResource.addQuery("cxs_searcher_config", current.getValue("cxs_searcher_config"));
	searcherResource.orderBy("order");
	searcherResource.query();
	
	if (!searcherResource.next())
		return;
	
	var srId = searcherResource.getUniqueValue();
	
	if (searcherResource.next())
		return;
	
	current.setValue("default_searcher_resource", srId);
})(current, previous);
