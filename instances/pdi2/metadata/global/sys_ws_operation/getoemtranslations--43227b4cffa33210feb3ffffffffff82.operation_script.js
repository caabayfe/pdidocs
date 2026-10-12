(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body || !request.body.data) {
		response.setStatus(400);
		response.setBody({
			isError: true,
			errorMessage: 'Request body or body.data is missing'
		});
		return response;
	}
	var textsToTranslate = request.body.data.textsToTranslate;
	var parms = request.body.data.parms;
	try {
		// Resolve translator sys_id to translator name
		if (parms && parms.translator) {
			var translatorSysId = parms.translator;
			var gr = new GlideRecord('sn_dt_translator_configuration');
			if (gr.get(translatorSysId)) {
				parms.translator = gr.getValue('name');
			} else {
				response.setStatus(400);
				response.setBody({
					isError: true,
					errorMessage: 'Translator configuration not found for sys_id: ' + translatorSysId
				});
				return response;
			}
		}
		var translatedResponse = sn_dt_api.DynamicTranslation.getTranslations(textsToTranslate, parms);
		translatedResponse['isError'] = false;
		response.setStatus(200);	
		response.setBody(translatedResponse);
		return response;
	}
	catch(ex) {
		response.setStatus(500);
		response.setBody({
			isError: true,
			errorMessage: ex.message
		});
		return response;
	}
})(request, response);
