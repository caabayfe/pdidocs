(function process(request, response) {

    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var policyType = helper.getParamAsString('cmdb_policy_type');
    var result = {};

    if (JSUtil.nil(policyType)) {
        return new sn_ws_err.BadRequestError('Missing cmdb_policy_type');
    }

    result.subflows = helper.getSubFlows(policyType);

    response.setStatus(200);
    response.setBody(result);
	
})(request, response);
