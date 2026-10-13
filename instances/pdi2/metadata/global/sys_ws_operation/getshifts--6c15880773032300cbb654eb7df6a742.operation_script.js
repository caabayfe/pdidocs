(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var groupSysId = request.pathParams.group_sys_id + "";
	var result = {};
	if (!groupSysId)
		return new sn_ws_err.BadRequestError(gs.getMessage("Group id not provided"));
	
	var ocsNG = new OnCallSecurityNG();
	if (!ocsNG.canCreateSchedule())
		return getSecurityConstraintError();
	
	if (ocsNG.rotaMgrAccess(groupSysId)) {
		var ocCreationWizUtils =  new OnCallCreationWizardUtils();
		result['shifts'] = ocCreationWizUtils.getShiftsByGroup(groupSysId);
		result['groupPreferences'] = ocCreationWizUtils.getPreferencesByGroup(groupSysId);
		return result;
	} else
		return getSecurityConstraintError();
		
	
	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage(gs.getMessage("Security constraints prevent access to requested resource"));
		return respError;
	}

})(request, response);
