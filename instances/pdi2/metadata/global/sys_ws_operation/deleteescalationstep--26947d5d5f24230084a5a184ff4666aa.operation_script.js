(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var escalationStepSysId = request.pathParams.escalation_step_sys_id;
	try {
		return new OCEscalationDesigner().deleteEscalationStep(escalationStepSysId);
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
