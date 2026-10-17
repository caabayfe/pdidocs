(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var text = request.body.data.text;
	var parms = request.body.data.parms;
	try {
		var detectedResponse = sn_dt_api.DynamicTranslation.getDetectedLanguage(text, parms);
		detectedResponse['isError'] = false;
		response.setStatus(200);
		response.setBody(detectedResponse);
		return response;
	}
	catch(ex) {
		response.setBody({
			isError: true,
			errorMessage: ex.message
		});
		return response;
	}

})(request, response);
