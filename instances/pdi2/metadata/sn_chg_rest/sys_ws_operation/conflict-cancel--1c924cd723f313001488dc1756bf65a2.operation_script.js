(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || "";
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeGR = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeGR.get(sysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	var changeConflict = new global.ChangeConflictAPI(changeGR);

	if (changeConflict.cancelConflictDetection())
		return global.ChangeCommon.toJS(changeConflict.getProgressRecord());

	return new sn_ws_err.BadRequestError("Conflict for change request could not be cancelled");

})(request, response);
