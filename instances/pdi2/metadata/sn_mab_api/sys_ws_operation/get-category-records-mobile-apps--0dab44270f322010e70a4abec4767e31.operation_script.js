(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {
		return new CategoryService().getMobileAppCategoryRecords();		
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
