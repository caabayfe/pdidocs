(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var myError = new sn_ws_err.ServiceError();
    var statusSysId = request.pathParams.statusId;
	var accountSysId = request.pathParams.serviceAccountId;

	var results = scheduleConfig.getDiscoverDatacenterInfoByStatusId(statusSysId, accountSysId);
	
	if (results.hasOwnProperty('statusResult')) {
		myError.setStatus(418);
		myError.setMessage(gs.getMessage("Unable to process request"));
		myError.setDetail(gs.getMessage('{0}', results.statusResult.message));
		response.setError(myError);
	} else if (results.hasOwnProperty('errorDetail')) {
		myError.setStatus(418);
		myError.setMessage(gs.getMessage("Unable to process request"));
		myError.setDetail(gs.getMessage('{0}', results.errorDetail));
		response.setError(myError);
	} else if (results.hasOwnProperty('datacentersList')) {
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(results.datacentersList);
	}
})(request, response);
