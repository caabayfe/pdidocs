(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var groupSysId = request.pathParams.groupSysId;
	if (!groupSysId)
		return new sn_ws_err.BadRequestError("Group id not provided");
	
	var userSysId = gs.getUserID();
	var ocup = new OnCallUserPreferences();
	return ocup.getContactOverridesForGroup(userSysId, groupSysId + "");

})(request, response);
