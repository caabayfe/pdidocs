(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var statsSysId = request.pathParams.id;

	var displayMessage;
	if (!statsSysId) {
		displayMessage = gs.getMessage('Invalid stats sys id passed');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	var errCode = sn_svcerr.ErrorCode.getByStatsId(statsSysId);

	if (!errCode) {
		displayMessage = gs.getMessage('Error code stats with id {0} does not exist').replace("{0}", statsSysId);
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}
	var errCodeObj = sn_svc_err.ErrorActionHelper.getErrorCodeObj(errCode);
	errCodeObj.statsSysId = statsSysId;
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(errCodeObj);
})(request, response);
