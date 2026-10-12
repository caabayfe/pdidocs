function setupSearchResourceId() {
	var dict = new GlideRecord("sys_dictionary");
	dict.addQuery("name", "cxs_search_res_config");
	dict.addQuery("element", "search_resource_id");
	dict.setLimit(1);
	dict.setUseEngines(false);
	dict.query();
	while (dict.next()) {
		if ("cxs_search_resource" !== dict.getValue("reference"))
			dict.setValue("reference", "cxs_search_resource");

		if ("advanced" !== dict.getValue("use_reference_qualifier"))
			dict.setValue("use_reference_qualifier", "advanced");

		if ("javascript:var ret='';if(!current.resource_type) ret='name!=GlideRecordSearchResource';else ret='name=GlideRecordSearchResource';ret" !== dict.getValue("reference_qual"))
			dict.setValue("reference_qual", "javascript:var ret='';if(!current.resource_type) ret='name!=GlideRecordSearchResource';else ret='name=GlideRecordSearchResource';ret");

		if (dict.update())
			gs.info("Successfully updated dictionary cxs_search_res_config.search_resource_id reference to cxs_search_resource and set advanced reference qualifier");
		else
			gs.info("Failed to update dictionary cxs_search_res_config.search_resource_id reference to cxs_search_resource and set advanced reference qualifier");
	}
}

function defaultSearchResourceId() {
	var gmu = new GlideMultipleUpdate("cxs_search_res_config");
	// Due to the way in which checks for "null" are handled, querying using these operators
	gmu.addQuery("search_resource_id", "STARTSWITH", "null");
	gmu.addQuery("search_resource_id", "ENDSWITH", "null");
	gmu.setValue("search_resource_id", "");
	gmu.execute();
}

setupSearchResourceId();
defaultSearchResourceId();
