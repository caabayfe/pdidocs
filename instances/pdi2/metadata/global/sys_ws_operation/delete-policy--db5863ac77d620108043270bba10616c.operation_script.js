(function process(request, response) {

    var helper = new CMDBDataManagerHelper();
    var ids = helper.getParamAsString('sys_ids');

    if (JSUtil.nil(ids) || ids.length == 0) {
        return new sn_ws_err.BadRequestError('Missing policySysId(s)');
    }

    var result = {};
    var errorSysIdList = helper.deletePolicies(ids);

    if (errorSysIdList.length > 0) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(500);
        error.setMessage('Error occcured while deleting Policies');
		error.setDetail('Error occured while deleting policies: ' + errorSysIdList);
        return error;
    }
    result.status = 'success';
    response.setStatus(200);
    response.setBody(result);
})(request, response);
