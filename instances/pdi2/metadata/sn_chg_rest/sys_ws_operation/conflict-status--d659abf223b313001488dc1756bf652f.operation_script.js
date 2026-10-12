(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || "";
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeGR = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeGR.get(sysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	var queryParams = request.queryParams;
	var changeConflict = new global.ChangeConflictAPI(changeGR);
	var progressGr = changeConflict.getProgressRecord();	
	var conflictsGr = changeConflict.getConflicts();

	var conflictStatus = {};
	conflictStatus.status = changeGR.getValue('conflict_status');
	conflictStatus.last_run = changeGR.getValue('conflict_last_run');
	conflictStatus.record_count = changeConflict.getConflictCount();
	conflictStatus.job_status = (progressGr ? progressGr.getValue('state') : 'not_started');
	conflictStatus.conflicts = global.ChangeCommon.getWindow(conflictsGr, queryParams.sysparm_limit, queryParams.sysparm_offset);

	return conflictStatus;
})(request, response);
