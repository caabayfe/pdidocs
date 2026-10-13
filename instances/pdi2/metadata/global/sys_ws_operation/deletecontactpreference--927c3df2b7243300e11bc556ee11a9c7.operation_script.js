(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var contactPrefSysId = request.pathParams.contact_pref_sys_id;
	try {
		return new OnCallContactPreferenceUtil().deleteContactPreference(contactPrefSysId);
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
