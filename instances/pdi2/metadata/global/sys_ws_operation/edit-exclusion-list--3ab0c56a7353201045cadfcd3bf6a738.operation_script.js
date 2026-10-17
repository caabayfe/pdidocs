(function process(request, response) {
    response.setContentType('application/json');
    var requestData = request.body.data;

    if ((JSUtil.nil(requestData.ci_add_list) && JSUtil.nil(requestData.ci_remove_list))|| (requestData.ci_add_list.length == 0 && requestData.ci_remove_list.length == 0) || JSUtil.nil(requestData.cmdb_policy_type)) {
        return new sn_ws_err.BadRequestError("Cannot perform edit Exclusion List operation without Cis and Policy type");
    }

    var result = {};
	var errorSysIdList = [];
    var helper = new CMDBDataManagerHelper();

	if (requestData.ci_remove_list.length)
		helper.removeCIFromExclusionList(requestData.ci_remove_list, requestData.cmdb_policy_type);

	if (requestData.ci_add_list.length)
		errorSysIdList = helper.addCIToExclusionList(requestData.ci_add_list, requestData.cmdb_policy_type);

    if (errorSysIdList.length > 0) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("Error occcured while creating CI Exclusion list");
        error.setDetail("Error occured while adding CIs " + errorSysIdList.toString() + " to the exclusion list");
        return error;
    }
    result.status = 'success';
    response.setStatus(200);
    response.setBody(result);
	
})(request, response);
