(function process(request, response) {

    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var policyId = helper.getParamAsString('sys_id');

    if (JSUtil.nil(policyId)) {
        return new sn_ws_err.BadRequestError("PolicyId is missing");
    }

    var result = helper.getPolicy(policyId);
    if (JSUtil.nil(result)) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("Policy not found");
        return error;
    }
    response.setStatus(200);
    response.setBody(result);
})(request, response);
