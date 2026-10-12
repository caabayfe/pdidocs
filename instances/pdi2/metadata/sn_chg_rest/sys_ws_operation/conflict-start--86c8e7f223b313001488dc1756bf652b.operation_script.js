(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || "";
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeGR = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeGR.get(sysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	//Validate that conflict detection can be run
	if (!global.ChangeCheckConflicts.allowConflictDetection(changeGR))
		return new sn_ws_err.BadRequestError("Unable to start conflict detection as Configuration item/Affected CIs, Planned start date and Planned end date are required");

	var changeConflict = new global.ChangeConflictAPI(changeGR);

	// Allows server to accept request for asynchronous process
	response.setStatus(202);

	return changeConflict.startConflictDetection();
})(request, response);
