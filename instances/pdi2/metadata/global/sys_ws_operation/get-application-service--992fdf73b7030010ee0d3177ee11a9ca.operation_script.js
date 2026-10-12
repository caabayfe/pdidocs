(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var helper = new CSDMAppServiceHelper();
	var id = helper.getParamAsString('sys_id');
	
	if (JSUtil.nil(id)) {
		return new sn_ws_err.BadRequestError('Missing sys_id');
	}
	
	var result = helper.getApplicationService(id);
	if (JSUtil.nil(result)) {
		var error = new sn_ws_err.ServiceError();
		error.setStatus(500);
		error.setMessage("Service not found");
		return error;
	}
	response.setStatus(200);
	response.setBody(result);

})(request, response);
