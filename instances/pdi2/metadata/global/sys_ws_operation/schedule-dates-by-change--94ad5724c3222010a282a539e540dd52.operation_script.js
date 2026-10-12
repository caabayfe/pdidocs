(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeRequestGr.get(changeSysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	if (!changeRequestGr.cmdb_ci || !changeRequestGr.start_date || !changeRequestGr.end_date)
		return new sn_ws_err.BadRequestError("cmdb_ci/planned start time/planned end time not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.pathParams);
	nameValuePairs.timezone = gs.getSession().getTimeZoneName();

	var changeManagementWorker = new global.ChangeManagementWorker();
	changeManagementWorker.run(nameValuePairs, global.ChangeManagementWorker.GET, global.ChangeManagementWorker.SCHEDULE );

	// Provide Async link in header
	response.setHeader("Link", changeManagementWorker.getResponseParam("worker").link + "");

	// Allows server to accept request for asynchronous process
	response.setStatus(202);

	return changeManagementWorker.toJS();

})(request, response);
