(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var groupSysId = request.pathParams.groupSysId;
	if (!groupSysId)
		return new sn_ws_err.BadRequestError("Group id not provided");

	var ocwUtils = new global.OnCallWorkbenchUtils();
	var groupDetails = ocwUtils.getGroupDetails(groupSysId);
	if (groupDetails) {
		if (!groupDetails.canRead)
			return getSecurityConstraintError();

		var access = ocwUtils.getAccessDetails(groupSysId);
		if (!access.isManager && !access.isMember)
			return getSecurityConstraintError();

		var resp = {};
		resp.group = groupDetails.groupJs;
		resp.filterGroups = ocwUtils.getGroups();
		resp.access = access;
		resp.rotas = ocwUtils.getActiveRotas(groupSysId);
		resp.memberCount = ocwUtils.getGroupMemberCount(groupSysId);
		resp.groupPreferencesId = ocwUtils.getGroupPreferenceIdByGroup(groupSysId);
		return resp;
	}

	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent access to requested resource");
		return respError;
	}

	return new sn_ws_err.NotFoundError("Requested Group not found");

})(request, response);
