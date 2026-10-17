(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var escalationSetSysId = request.pathParams.escalation_set_sys_id;
	var currentEscalationLevel = request.queryParams.sysparm_escalation_level;
	var rotaSysId = request.queryParams.rota_sys_id + '';
	try {
		return new OCEscalationDesigner().incrementStepsEscalationLevel(escalationSetSysId, currentEscalationLevel, rotaSysId);
	} catch (e) {
		if (e.securityError) {
			var body = {
				error: {
					message: e.message
				}
			};
			response.setBody(body);
			response.setStatus(403);
		}
		else {
			return new sn_ws_err.BadRequestError(e.message);
		}
	}
})(request, response);
