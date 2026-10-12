(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {
		return (new CategoryService()).getCategoryRecords(request.queryParams);		
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
