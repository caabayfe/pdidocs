(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		var suggestionsService = new SuggestionsService();
		var table = request.queryParams.table[0];
		var query = request.queryParams.query[0];
		var fields = request.queryParams.fields || [];
		
		if (!table) {
			throw new Error('Table parameter is required');
		}
		
		if (!query) {
			throw new Error('Query parameter is required');
		}

		return suggestionsService.getSuggestions(table, query);
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}
})(request, response);
