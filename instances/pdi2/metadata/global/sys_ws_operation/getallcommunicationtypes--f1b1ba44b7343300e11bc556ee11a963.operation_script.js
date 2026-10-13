(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		return new OnCallContactPreferenceUtil().getAllCommunicationTypes();
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
