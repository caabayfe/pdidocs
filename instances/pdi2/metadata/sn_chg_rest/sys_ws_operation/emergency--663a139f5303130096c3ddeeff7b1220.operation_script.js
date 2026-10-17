(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);
	var state;
	if (nameValuePairs.state) {
		state = nameValuePairs.state;
		delete nameValuePairs.state;
	}

	var changeProcess = global.EmergencyChangeProcess.newChangeProcess(nameValuePairs);

	if (state && !changeProcess.canMoveTo(state)) {
		var error = new sn_ws_err.ServiceError();
		error.setStatus(400);
		error.setMessage("Emergency Change Request cannot move to state: " + state);
		error.setDetail(JSON.stringify(changeProcess.evaluateMoveTo(state)));
		return error;
	}

	if ((!state && changeProcess.insert()) || (state && changeProcess.moveTo(state) && changeProcess.insert())) {
		var result = changeProcess.toJS();
		result.__meta = { ignoredFields: changeProcess.__ignoredfields || [] };
		return result;
	}

	var errorMessage = "Could not create Emergency Change Request.";
	var lastErrorMessage = changeProcess.getGlideRecord().getLastErrorMessage();
	if (lastErrorMessage)
		errorMessage += " " + lastErrorMessage;

	return new sn_ws_err.BadRequestError(errorMessage);
})(request, response);
