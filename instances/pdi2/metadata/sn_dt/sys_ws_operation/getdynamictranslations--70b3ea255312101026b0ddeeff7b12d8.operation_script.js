(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var textsToTranslate = request.body.data.textsToTranslate;
	var parms = request.body.data.parms;
	try {
		var translatedResponse = sn_dt_api.DynamicTranslation.getTranslations(textsToTranslate, parms);
		translatedResponse['isError'] = false;
		response.setStatus(200);	
		response.setBody(translatedResponse);
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
