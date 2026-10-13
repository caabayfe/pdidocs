(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {};
	var dataObject = request.body.data;
	var scheduleConfig = new CloudDiscoveryScheduleConfig();

	var datacenterClassType = dataObject.datacenterClass;

        // Skip account validation in case of VMware as VMware patterns not available
	if (datacenterClassType.equals('cmdb_ci_vcenter_datacenter'))
		result = scheduleConfig.saveServiceAccount(dataObject);
	else {
		try {
		 	// Account validation is triggered irrespective of Gov/Standard cloud
			result = scheduleConfig.initializeValidateAccount(dataObject);
		} catch (err) {
			result.errorDetail = err;
		}
	}
	
	if (result.hasOwnProperty('errorDetail')) {
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(418);
		myError.setMessage(gs.getMessage("Unable to process request"));
		myError.setDetail(gs.getMessage('{0}', result.errorDetail));
		response.setError(myError);
	} else {
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(result);
	}
})(request, response);
