(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", changeSysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError("Change Request not found");

	var taskSysId = request.pathParams.task_sys_id || "";
	if (!taskSysId)
		return new sn_ws_err.BadRequestError("Change Task id not provided");

	var changeTask = global.ChangeTask.bySysId(taskSysId);
	if (!changeTask)
		return new sn_ws_err.NotFoundError("Change Task not found");

	if (changeSysId !== changeTask.getGlideRecord().change_request + "")
		return new sn_ws_err.BadRequestError("Change Task found, but not related to Change Request: " + changeSysId);

	var fields = changeTask.setValues(global.ChangeCommon.assign({}, request.queryParams, request.body.data));
	if (changeTask.update()) {
		var result = changeTask.toJS();
		result.__meta = { ignoredFields: fields.ignored && fields.ignored.length > 0 ? fields.ignored : [] };
		return result;
	}

	var errorMessage = "Change Task record could not be updated.";
	var lastErrorMessage = changeTask.getGlideRecord().getLastErrorMessage();
	if (lastErrorMessage)
		errorMessage += " " + lastErrorMessage;

	return new sn_ws_err.BadRequestError(errorMessage);
})(request, response);
