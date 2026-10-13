(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var textToTranslate = request.body.data.textToTranslate;
	var parms = request.body.data.parms;
	try {
		var translatedResponse = sn_dt_api.DynamicTranslation.getTranslation(textToTranslate, parms);
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
