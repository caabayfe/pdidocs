(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Emergency Change Request id not provided");

	var changeProcess = global.EmergencyChangeProcess.findById(sysId);
	if (!changeProcess)
		return new sn_ws_err.NotFoundError("Emergency Change Request not found");

	if (!changeProcess.deleteRecord())
		return new sn_ws_err.BadRequestError("Emergency Change Request not deleted");

	return changeProcess.toJS();
})(request, response);
