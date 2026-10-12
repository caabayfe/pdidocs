(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new SchedulePageUtilSNC();
    var dataSourceClass = util.getClassName(request.pathParams.schedule_page_sys_id);
	var infoType = request.pathParams.info_type;
	if (dataSourceClass) {
		var dataSourceObj = util.getObjInstance(dataSourceClass, this);
		dataSourceObj.setSchedulePageId(request.pathParams.schedule_page_sys_id);
		var resp = dataSourceObj.updateCustomInfo(infoType, request.body.data, request.queryParams);
		if (resp.apiError && resp.errorType == 'security' ) {
			var respError = new sn_ws_err.ServiceError();
			respError.setStatus(403);
			respError.setMessage(resp.apiError);
			return respError;
		} else if (resp.apiError)
			return new sn_ws_err.BadRequestError(resp.apiError);
		else
			return resp;
	}
	return new sn_ws_err.BadRequestError(gs.getMessage('A valid implementation for datasource Script Include is missing.'));

})(request, response);
