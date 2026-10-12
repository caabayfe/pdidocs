(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
		var param = request.pathParams.param;
		var queryParams = request.queryParams;
		
		return (new CategoryService()).getScreens(queryParams, param);
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
