(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var scriptName = '' + request.queryParams['Transform'] + request.headers['Transform'];
	gs.info(scriptName);
	if (scriptName.indexOf('SAPSolman') !== -1){
		var body = {};
		body.text = "GET: Functionality is only for test purpose, to use Inbount Event API change the method to POST";
		response.setBody(body);
	}else
		response.setError(new sn_ws_err.BadRequestError('Unsupported API, to use Inbount Event API change the method to POST'));
	
})(request, response);
