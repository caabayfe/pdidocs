(function process(request, response) {
    response.setContentType('application/json');
    var helper = new CMDBDataManagerHelper();
    var state = helper.getParamAsString('state');

    if (JSUtil.nil(state)) {
        return new sn_ws_err.BadRequestError("state is missing");
    }

    var result = {};
    result.policy_tasks = helper.getPolicyTaskCount(state);
    response.setStatus(200);
    response.setBody(result);
})(request, response);
