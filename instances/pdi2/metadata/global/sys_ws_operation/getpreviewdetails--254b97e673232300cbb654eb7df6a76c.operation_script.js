(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var groupSysId = request.queryParams.group_sys_id + "";
	
	if (!groupSysId)
		return new sn_ws_err.BadRequestError(gs.getMessage("Group id not provided"));
	
	var ocsNG = new OnCallSecurityNG();
	if (!ocsNG.rotaMgrAccess(groupSysId))
		return getSecurityConstraintError();
	
	var occwUtils = new OnCallCreationWizardUtils();
	var result = {};
	result.groupDetails = occwUtils.getGroupDetails(groupSysId);
	result.groupMemberCount = occwUtils.getGroupMemberCount(groupSysId);
	result.shifts = occwUtils.getPreviewRotaDetails(groupSysId);
	
	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage(gs.getMessage("Security constraints prevent access to requested resource"));
		return respError;
	}
	
	return result;
	
})(request, response);
