(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var contactPreferenceSysId = request.pathParams.contact_preference_sys_id + "";
	if (!contactPreferenceSysId)
		return new sn_ws_err.BadRequestError("On-Call User Contact preference id not provided");
	
	var ocucpGr = new GlideRecord("on_call_user_contact_preference");
	if (ocucpGr.get(contactPreferenceSysId)) {
		if (ocucpGr.canDelete()) {
			if (!ocucpGr.deleteRecord())
				return new sn_ws_err.BadRequestError("On-Call User Contact preference deletion failed");
		} else
			return getSecurityConstraintError();
	} else
		return new sn_ws_err.BadRequestError("Invalid sys id provided");
	
	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent access to requested resource");
		return respError;
	}

	return;
	
})(request, response);
