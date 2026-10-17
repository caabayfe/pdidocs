(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {	
		var results = new CloudDiscoveryScheduleConfig().getMasterAccountRESTUtil(request.pathParams.parent_account,request.pathParams.mid_server,JSUtil.toBoolean(request.pathParams.cluster_selected));
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(results);
	} catch (err) {
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(418);
		myError.setMessage(gs.getMessage("Unable to process request"));
		myError.setDetail(err);
		response.setError(myError);
	}
    
})(request, response);
