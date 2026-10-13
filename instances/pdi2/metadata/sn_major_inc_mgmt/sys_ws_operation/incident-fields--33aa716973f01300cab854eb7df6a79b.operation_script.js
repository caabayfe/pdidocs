(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId)
		return new sn_ws_err.BadRequestError("Incident id not provided");

	var requiredFields = request.queryParams.fields;
	if (!requiredFields)
		return new sn_ws_err.BadRequestError("Fields not provided");

	var workbenchUtils = new global.MIMWorkbenchUtil();
	requiredFields = requiredFields[0].split(',');
	return workbenchUtils.getIncidentFields(incidentSysId, requiredFields);
})(request, response);
