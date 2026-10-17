(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var cmdbSysID = request.pathParams.cmdb_ci_sys_id || "";
	var startTime = request.queryParams.planned_start_time || ""; //expect UTC date time
	var duration = request.queryParams.duration_in_seconds || "";
	
	if (!cmdbSysID) 
		return new sn_ws_err.BadRequestError("cmdb_ci not provided");
	
	var grs = new GlideRecordSecure('cmdb_ci');
	if (!grs.get(cmdbSysID))
		return new sn_ws_err.BadRequestError("cmdb_ci not found");
		
	if (!duration)
		return new sn_ws_err.BadRequestError("duration_in_seconds not provided");
	
	if (isNaN(duration) || parseInt(duration, 10) <= 0)
		return new sn_ws_err.BadRequestError("duration_in_seconds must be a positive integer");
	
	if (startTime) {
		var gdt = new GlideDateTime(startTime);
		if (!gdt.isValid())
			return new sn_ws_err.BadRequestError("planned_start_time is invalid");
	}
	
	var nameValuePairs = {};
	nameValuePairs.cmdb_ci_sys_id = cmdbSysID;
	nameValuePairs.planned_start_time = startTime;
	nameValuePairs.duration_in_seconds = parseInt(duration, 10);
	nameValuePairs.timezone = gs.getSession().getTimeZoneName();
	
	var changeManagementWorker = new global.ChangeManagementWorker();
	changeManagementWorker.run(nameValuePairs, global.ChangeManagementWorker.GET, global.ChangeManagementWorker.SCHEDULE );

	// Provide Async link in header
	response.setHeader("Link", changeManagementWorker.getResponseParam("worker").link + "");

	// Allows server to accept request for asynchronous process
	response.setStatus(202);

	return changeManagementWorker.toJS();
	
})(request, response);
