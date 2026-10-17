(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var groupSysId = request.queryParams.group_id;
	var ocwUtils = new global.OnCallWorkbenchUtils();
	try {
		return {
			rotas: ocwUtils.getGroupRotas(groupSysId)
		};
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
