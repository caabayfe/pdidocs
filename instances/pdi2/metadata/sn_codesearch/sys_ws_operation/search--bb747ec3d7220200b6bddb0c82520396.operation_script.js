(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var empty = "value not provided";
	
    //The api returns some strings as NativeArrays which is not ideal
	var term = getParamAsString("term");
	var table = getParamAsString("table");
	var limit = getParamAsString("limit");
	var search_group = getParamAsString("search_group");
    var search_all_scopes = getParamAsString("search_all_scopes");
	var current_app = getParamAsString("current_app");
	var extended_matching = getParamAsString("extended_matching");

	//lets help a dev debug
	gs.debug("Search term is {0}", term ? term : empty);
	gs.debug("Search against table {0}", table ? table : empty);
	gs.debug("In search group {0}", search_group ? search_group : empty);
	gs.debug("With requested limit {0}", limit ? limit : empty);
	gs.debug("Search all app scopes: {0}", search_all_scopes ? search_all_scopes : empty);
	gs.debug("Home scope is {0}", current_app ? current_app : empty);
	gs.debug("Use extended matching is {0}", extended_matching ? extended_matching : empty);
	
    if (!search_all_scopes || search_all_scopes == "false")
        search_all_scopes = false;
	
	var searcher = CodeSearch()
					.setSearchGroup(search_group)
					.setSearchAllScopes(search_all_scopes)
					.setSearchTable(table)
					.setCurrentApplication(current_app)
					.setExtendedMatching(extended_matching);
	
	//allow requests to specify a limit, always less than our max
	if (limit)
		searcher.setLimit(limit);
	
	gs.info("Initiating search for {0} from search API.", term);
	
	//We want to keep the browser from caching these responses
	response.setHeader("Cache-Control", "no-cache,no-store,must-revalidate,max-age=-1");
	response.setHeader("Pragma", "no-store,no-cache");
	response.setHeader("Expires","Thu, 01 Jan 1970 00:00:00");
	
	return searcher.search(term);
	
	//make sure we always get strings from the parameter map
	function getParamAsString(paramName) {
		if (request.queryParams.hasOwnProperty(paramName))
			return request.queryParams[paramName] + '';

		return '';
	}
})(request, response);
