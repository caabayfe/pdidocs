(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", changeSysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError("Change Request not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams);
	nameValuePairs.task = changeSysId;

	var changeManagementWorker = new global.ChangeManagementWorker();
	changeManagementWorker.run(nameValuePairs);

	// Provide Async link in header
	response.setHeader("Link", changeManagementWorker.getResponseParam("worker").link + "");

	// Allows server to accept request for asynchronous process
	response.setStatus(202);

	return changeManagementWorker.toJS();
})(request, response);
