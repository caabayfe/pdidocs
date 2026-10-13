(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		var CloudResourceDiscoveryUtilObj = new CloudResourceDiscoveryUtil();
		var results = CloudResourceDiscoveryUtilObj.getFormFieldsValidationFormats();
		gs.info('@Peru : ' + results);
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(results.formFieldsValidationFormats);
	} catch (err) {
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(418);
		myError.setMessage(gs.getMessage("Unable to process request"));
		myError.setDetail(err);
		response.setError(myError);
	}
})(request, response);
