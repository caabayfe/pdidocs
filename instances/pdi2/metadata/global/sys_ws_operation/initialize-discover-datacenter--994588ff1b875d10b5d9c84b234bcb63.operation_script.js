(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var result = new CloudDiscoveryScheduleConfig().getDiscoveredDataCenterRESTUtil(request.pathParams.service_account,JSUtil.toBoolean(request.pathParams.refresh_datacenters),request.pathParams.selected_mid,false);
	
	if (result.hasOwnProperty('errorDetail')) {
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(418);
		myError.setMessage(gs.getMessage("Unable to process request"));
		myError.setDetail(result.errorDetail);
		response.setError(myError);
	} else if (result.hasOwnProperty('resultData')) {
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(result.resultData);
	}
})(request, response);
