(function process(request, response) {

	response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
	var includeOnDemandPolicyType = helper.getParamAsString('include_on_demand_policy_type');
    var result = {};
	if (JSUtil.nil(includeOnDemandPolicyType)) {
        return new sn_ws_err.BadRequestError('Missing include_on_demand_policy_type param');
    }
	result.policy_types = helper.getPolicyTypes(includeOnDemandPolicyType);
    response.setStatus(200);
    response.setBody(result);
})(request, response);
