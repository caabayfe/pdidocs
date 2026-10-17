(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {
		return new MobileTableInfoService().getMobileTableNamesAndLabels();		
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
