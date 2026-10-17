(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var rotaSysId = request.pathParams.rota_sys_id;
	var forceCreate = request.queryParams.sysparm_force_create == 'true';
	try {
		return new OCEscalationDesigner().getDefaultEscalation(rotaSysId, forceCreate);
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
