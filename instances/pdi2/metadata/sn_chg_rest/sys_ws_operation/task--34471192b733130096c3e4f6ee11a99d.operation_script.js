(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", changeSysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError("Change Request not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);
	nameValuePairs.change_request = changeRequestGr.getUniqueValue();
	var changeTask = global.ChangeTask.newChangeTask(nameValuePairs);
	if (!changeTask || !changeTask.getGlideRecord().getUniqueValue())
		return new sn_ws_err.BadRequestError("Could not create Change Task.");

	if (changeSysId !== changeTask.getGlideRecord().change_request + "")
		return new sn_ws_err.BadRequestError("Change Task found, but not related to Change Request: " + changeSysId);

	return changeTask.toJS();
})(request, response);
