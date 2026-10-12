(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var pathParams = request.pathParams;

	if (!pathParams.standard_change_template_id)
		return new sn_ws_err.BadRequestError("Standard Change Template id not provided");

	var standardChangeTemplate = "";
	if (GlidePluginManager.isActive("com.snc.change_management.standard_change_catalog")) {
		var templateSysId = pathParams.standard_change_template_id + "";
		standardChangeTemplate = global.StandardChangeTemplate.findById(templateSysId);

		if (!standardChangeTemplate)
			return new sn_ws_err.NotFoundError("Standard Change Template not found");
	}

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);
	var state;
	if (nameValuePairs.state) {
		state = nameValuePairs.state;
		delete nameValuePairs.state;
	}

	var changeProcess = global.StandardChangeProcess.newChangeProcess(standardChangeTemplate, nameValuePairs);

	if (state && !changeProcess.canMoveTo(state)) {
		var error = new sn_ws_err.ServiceError();
		error.setStatus(400);
		error.setMessage("Standard Change Request cannot move to state: " + state);
		error.setDetail(JSON.stringify(changeProcess.evaluateMoveTo(state)));
		return error;
	}

	if ((!state && changeProcess.insert()) || (state && changeProcess.moveTo(state) && changeProcess.insert())) {
		var result = changeProcess.toJS();
		result.__meta = { ignoredFields: changeProcess.__ignoredfields || [] };
		return result;
	}

	var errorMessage = "Could not create Standard Change Request.";
	var lastErrorMessage = changeProcess.getGlideRecord().getLastErrorMessage();
	if (lastErrorMessage)
		errorMessage += " " + lastErrorMessage;

	return new sn_ws_err.BadRequestError(errorMessage);
})(request, response);
