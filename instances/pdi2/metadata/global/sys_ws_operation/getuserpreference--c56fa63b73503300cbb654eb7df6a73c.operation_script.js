(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var userPreferenceSysId = request.queryParams.user_preference_sys_id;
	var ocupGr = new GlideRecord("on_call_user_preference");
	if (userPreferenceSysId) {
		if (!ocupGr.get(userPreferenceSysId + ""))
			return new sn_ws_err.BadRequestError("Invalid sys id provided");
		if (!ocupGr.getValue('user') == gs.getUserID())
			return getSecurityConstraintError();
	} 
	// if user prefernce id not provided return first active preference
	else { 
		ocupGr.addQuery('user', gs.getUserID());
		ocupGr.setLimit(1);
		ocupGr.query();
		if (!ocupGr.next())
			return;
	}
	
	var upUtils = new OnCallUserPreferences();
	var result = {};
	result.userPreferenceDetails = upUtils.getUserPreferenceDetails(ocupGr);
	result.userContactPreferences = upUtils.getUserContactPreferences(ocupGr.sys_id + "", gs.getUserID());
	return result;
	
	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent access to requested resource");
		return respError;
	}
	
})(request, response);
