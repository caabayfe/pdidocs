(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var taskSysId = request.pathParams.task_sys_id || "";
	if (!taskSysId)
		return new sn_ws_err.BadRequestError("Change Task id not provided");

	var changeTask = global.ChangeTask.bySysId(taskSysId);
	if (!changeTask)
		return new sn_ws_err.NotFoundError("Change Task not found");

	if (changeSysId !== changeTask.getGlideRecord().change_request + "")
		return new sn_ws_err.BadRequestError("Change Task found, but not related to Change Request: " + changeSysId);

	return changeTask.toJS();
})(request, response);
