(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		return new UIRuleActionFieldsService(request.queryParams).getOperationOptions();
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
