(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeRequestGr.get(changeSysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	if (changeRequestGr.start_date === null
		|| changeRequestGr.end_date === null
		|| !changeRequestGr.start_date.canWrite()
		|| !changeRequestGr.end_date.canWrite())
		throw new sn_ws_err.ServiceError()
				.setStatus(403)
				.setMessage(gs.getMessage("Operation Failed"))
				.setDetail(gs.getMessage("ACL Exception Update Failed due to security constraints"));

	if (!changeRequestGr.cmdb_ci )
		return new sn_ws_err.BadRequestError("cmdb_ci not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.pathParams, request.body.data);

	if (!nameValuePairs.duration_in_seconds)
		return new sn_ws_err.BadRequestError("duration_in_seconds not provided");

	if (isNaN(nameValuePairs.duration_in_seconds) || parseInt(nameValuePairs.duration_in_seconds, 10) <= 0)
		return new sn_ws_err.BadRequestError("duration_in_seconds is invalid");

	nameValuePairs.duration_in_seconds = parseInt(nameValuePairs.duration_in_seconds, 10);
	nameValuePairs.timezone = gs.getSession().getTimeZoneName();

	if (nameValuePairs.planned_start_time) {
		var gdt = new GlideDateTime(nameValuePairs.planned_start_time);
		if (!gdt.isValid())
			return new sn_ws_err.BadRequestError("planned_start_time is invalid");
	}

	var changeManagementWorker = new global.ChangeManagementWorker();
	changeManagementWorker.run(nameValuePairs, global.ChangeManagementWorker.UPDATE, global.ChangeManagementWorker.SCHEDULE );

	// Provide Async link in header
	response.setHeader("Link", changeManagementWorker.getResponseParam("worker").link + "");

	// Allows server to accept request for asynchronous process
	response.setStatus(202);

	return changeManagementWorker.toJS();

})(request, response);
