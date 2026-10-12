(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Normal Change Request id not provided");

	var changeProcess = global.NormalChangeProcess.findById(sysId);
	if (!changeProcess)
		return new sn_ws_err.NotFoundError("Normal Change Request not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);

	var state;
	if (nameValuePairs.state) {
		state = nameValuePairs.state;
		delete nameValuePairs.state;
	}

	var fields = changeProcess.setValues(nameValuePairs);

	if (state && !changeProcess.canMoveTo(state)) {
		var error = new sn_ws_err.ServiceError();
		error.setStatus(400);
		error.setMessage("Normal Change Request cannot move to state: " + state);
		error.setDetail(JSON.stringify(changeProcess.evaluateMoveTo(state)));
		return error;
	}

	if ((!state && changeProcess.update()) || (state && changeProcess.moveTo(state) && changeProcess.update())) {
		var result = changeProcess.toJS();
		result.__meta = { ignoredFields: fields.ignored && fields.ignored.length > 0 ? fields.ignored : [] };
		return result;
	}

	var errorMessage = "Normal Change Request record could not be updated.";
	var lastErrorMessage = changeProcess.getGlideRecord().getLastErrorMessage();
	if (lastErrorMessage)
		errorMessage += " " + lastErrorMessage;

	return new sn_ws_err.BadRequestError(errorMessage);	
})(request, response);
