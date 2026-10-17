(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", sysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError("Change Request not found");

	var changeProcess = new global.ChangeProcess(changeRequestGr);
	if (!changeProcess)
		return new sn_ws_err.NotFoundError("Change Request not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);

	if (!nameValuePairs.state)
		return new sn_ws_err.BadRequestError("Approval state parameter not provided. Valid state parameter is: approved or rejected");
	
	var state = nameValuePairs.state.toLowerCase();
	var comments = nameValuePairs.comments || null;

	if ((state === "approved" && changeProcess.approve(comments)) || (comments && state === "rejected" && changeProcess.reject(comments)))
		return changeProcess.toJS();

	var errorMessage = "Change Request approval could not be processed.";
	var lastErrorMessage = changeProcess.getGlideRecord().getLastErrorMessage();
	if (lastErrorMessage)
		errorMessage += " " + lastErrorMessage;

	if (!comments && state === "rejected")
		errorMessage += " Comments are mandatory when rejecting changes";
	
	if (state !== "approved" && state !== "rejected")
		errorMessage += " Expecting state to be appproved or rejected, not: " + state;

	return new sn_ws_err.BadRequestError(errorMessage);
})(request, response);
