(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	try {
		return new TableInfoService().getTableNamesAndLabels(request.queryParams);		
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}
	
})(request, response);
