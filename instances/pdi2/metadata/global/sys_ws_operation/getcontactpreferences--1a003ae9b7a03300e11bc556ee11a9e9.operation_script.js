(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var type = request.pathParams.type;
    var sysId = request.pathParams.sysId;
	try {
		return new OnCallContactPreferenceUtil().getContactPreferences(type, sysId);
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
