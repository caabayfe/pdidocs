(function process(request, response) {
    response.setContentType('application/json');
    var result = {};
    var policyId = request.pathParams.sys_id;
    var helper = new CMDBDataManagerHelper();
    var requestData = request.body.data;
    var errorMessage = "";

    if (JSUtil.nil(policyId) || JSUtil.nil(requestData.policy_details) || !helper.isMandatoryDataAvailable(requestData.policy_details)) {
        errorMessage = "Mandatory fields are missing from the request";
    } else if (!helper.isNameAvailable(requestData.policy_details.name, policyId)) {
        errorMessage = "The policy name is already in use";
    }
    if (errorMessage) {
        return new sn_ws_err.BadRequestError(errorMessage);
    }

    var policyDetails = helper.updatePolicy(requestData.policy_details, policyId);
    if (!JSUtil.nil(policyDetails.error)) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(500);
        error.setMessage("Failed to Update Policy");
        error.setDetail(policyDetails.error);
        return error;
    }
    result.status = policyDetails.status;
	result.sys_id = policyDetails.policySysId;
    response.setStatus(200);
    response.setBody(result);
})(request, response);
