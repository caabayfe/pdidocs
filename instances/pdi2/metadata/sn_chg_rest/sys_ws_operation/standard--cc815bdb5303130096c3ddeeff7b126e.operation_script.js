(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Standard Change Request id not provided");

	var changeProcess = global.StandardChangeProcess.findById(sysId);
	if (!changeProcess)
		return new sn_ws_err.NotFoundError("Standard Change Request not found");

	return changeProcess.toJS();
})(request, response);
