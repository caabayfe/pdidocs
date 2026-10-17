(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Normal Change Request id not provided");

	var changeProcess = global.NormalChangeProcess.findById(sysId);
	if (!changeProcess)
		return new sn_ws_err.NotFoundError("Normal Change Request not found");

	if (!changeProcess.deleteRecord())
		return new sn_ws_err.BadRequestError("Normal Change Request not deleted");

	return changeProcess.toJS();
})(request, response);
