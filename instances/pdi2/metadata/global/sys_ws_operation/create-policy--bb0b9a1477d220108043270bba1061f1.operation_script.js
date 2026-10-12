(function process(request, response) {
    response.setContentType('application/json');

    var helper = new CMDBDataManagerHelper();
    var requestData = request.body.data;
    var errorMessage = "";
    if (JSUtil.nil(requestData.policy_details) || !helper.isMandatoryDataAvailable(requestData.policy_details)) {
        errorMessage = "Mandatory fields are missing from the request";
    } else if (!helper.isNameAvailable(requestData.policy_details.name)) {
        errorMessage = "The policy name is already in use";
    }
    if (errorMessage) {
        return new sn_ws_err.BadRequestError(errorMessage);
    }
    var result = {};
    var policyDetails = helper.createPolicy(requestData.policy_details);
    if (!JSUtil.nil(policyDetails.error)) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("Error in creating policy");
        error.setDetail(policyDetails.error);
        return error;
    }
    result.sys_id = policyDetails.policySysId;
	result.policy_details = policyDetails;
    response.setStatus(200);
    response.setBody(result);
})(request, response);
