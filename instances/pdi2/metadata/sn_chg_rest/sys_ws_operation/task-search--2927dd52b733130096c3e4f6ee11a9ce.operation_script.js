(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", changeSysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError("Change Request not found");

	return global.ChangeCommon.getWindow(new global.ChangeProcess(changeRequestGr).getTasks(), request.queryParams.sysparm_limit || null, request.queryParams.sysparm_offset || null);
})(request, response);
