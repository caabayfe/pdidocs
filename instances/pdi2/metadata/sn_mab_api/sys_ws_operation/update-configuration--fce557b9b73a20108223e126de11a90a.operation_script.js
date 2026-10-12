(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {
	return new sn_mab_api.UpdateConfigurationService().processRecords(request.body.data);
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

})(request, response);
