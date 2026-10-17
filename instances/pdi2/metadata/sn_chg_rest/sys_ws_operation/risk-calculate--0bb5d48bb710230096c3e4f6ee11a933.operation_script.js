(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || "";
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeRequestGr.get(sysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	var evaluatedRiskImpact = new global.RiskCalculator(changeRequestGr).evaluateRiskImpact();
	if (!evaluatedRiskImpact)
		return new sn_ws_err.BadRequestError("Failed to evaluate Risk and Impact");

	if (evaluatedRiskImpact && evaluatedRiskImpact.errorMsg)
		return new sn_ws_err.BadRequestError(evaluatedRiskImpact.errorMsg);

	// refresh the gliderecord
	changeRequestGr.get(changeRequestGr.getUniqueValue());
	return new global.ChangeRequest(changeRequestGr).toJS();
})(request, response);
