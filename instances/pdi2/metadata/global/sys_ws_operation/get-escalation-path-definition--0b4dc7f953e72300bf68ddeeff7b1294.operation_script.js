(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var rotaId = request.queryParams.rota_id ? request.queryParams.rota_id + "" : "";
    var escalationSetSysId = request.queryParams.escalation_set_sys_id ? request.queryParams.escalation_set_sys_id + "" : "";
	try {
		return new OnCallCommon().getEscalationPathDefinition(rotaId, escalationSetSysId);
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
