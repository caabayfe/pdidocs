(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var userPreferenceSysId = request.pathParams.user_preference_sys_id + "";
	if (!userPreferenceSysId)
		return new sn_ws_err.BadRequestError("On-Call User contact preference id not provided");
	
	var ocupGr = new GlideRecord("on_call_user_preference");
	if (ocupGr.get(userPreferenceSysId)) {
		if (ocupGr.canDelete()) {
			ocupGr.deleteRecord();
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
