(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var escalationSetSysId = request.pathParams.escalation_set_sys_id;
	var rotaId = request.queryParams.rota_sys_id + '';
	try {
		return new OCEscalationDesigner().getEscalationSet(escalationSetSysId, rotaId);
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
