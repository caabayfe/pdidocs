(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		return new UIRuleActionFieldsService(request.queryParams).getTargetOptions();
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
