(function refineQuery(current, parent) {
	current.addQuery("cxs_context_config", parent.sys_id);
	current.addNullQuery("cxs_search_res_config.resource_type");
})(current, parent);
