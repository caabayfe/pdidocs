(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	//The api returns some strings as NativeArrays which is not ideal
	var search_group = getParamAsString("search_group");

	//lets help a dev debug
	gs.debug("Getting tables for search group {0}", search_group ? search_group : empty);
	
	var searcher = CodeSearch()
					.setSearchGroup(search_group);
	
	//We want to keep the browser from caching these responses
	response.setHeader("Cache-Control", "no-cache,no-store,must-revalidate,max-age=-1");
	response.setHeader("Pragma", "no-store,no-cache");
	response.setHeader("Expires","Thu, 01 Jan 1970 00:00:00");
	
	return searcher.getAllSearchableTables(true);
	
	
	//make sure we always get strings from the parameter map
	function getParamAsString(paramName) {
		if (request.queryParams.hasOwnProperty(paramName))
			return request.queryParams[paramName] + '';

		return '';
	}

})(request, response);
