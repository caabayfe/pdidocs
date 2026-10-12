(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    var result = {};
	var helper = new CMDBDataManagerHelper();
	var policyId = request.pathParams.sys_id;
	var requestData = request.body.data;
    if (JSUtil.nil(policyId)) {
        return new sn_ws_err.BadRequestError(gs.getMessage("The policy ID is missing from the request"));
    }
	if (!requestData || !helper.isValidStatus(requestData.status)) {
		return new sn_ws_err.BadRequestError(gs.getMessage("{0} is not a valid policy status", (!requestData || !requestData.status) ? "(empty)" : requestData.status));
	}
	if (!helper.isNextStatusValid(policyId, requestData.status)) {
		return new sn_ws_err.BadRequestError(gs.getMessage("{0} is not a valid transition from the current policy status", requestData.status));
	}
	result = helper.setPolicyStatus(policyId, requestData.status);
    if (result.error || JSUtil.nil(result.sys_id)) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(500);
		result.error ? error.setMessage(result.error) : error.setMessage(gs.getMessage("Failed to set the policy status"));
        error.setDetail(gs.getMessage("Failed to set the policy status"));
        return error;
    }
    response.setStatus(200);
    response.setBody(result);

})(request, response);
