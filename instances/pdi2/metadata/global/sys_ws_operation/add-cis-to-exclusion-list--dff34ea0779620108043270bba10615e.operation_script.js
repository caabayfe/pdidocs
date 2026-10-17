(function process(request, response) {
    response.setContentType('application/json');
    var requestData = request.body.data;

    if (JSUtil.nil(requestData.ci_list) || requestData.ci_list.length == 0 || JSUtil.nil(requestData.cmdb_policy_type)) {
        return new sn_ws_err.BadRequestError("Cannot perform Exclude operation without Cis and Policy type");
    }

    var result = {};
    var helper = new CMDBDataManagerHelper();
    var errorSysIdList = helper.addCIToExclusionList(requestData.ci_list, requestData.cmdb_policy_type);

    if (errorSysIdList.length > 0) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("Error occcured while creating CI Exclusion list");
        error.setDetail("Error occured while adding CIs " + errorSysIdList + " to the exclusion list");
        return error;
    }
    result.status = 'success';
    response.setStatus(200);
    response.setBody(result);
	
})(request, response);
