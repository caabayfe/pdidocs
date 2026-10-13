(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var groupId = request.queryParams.group_id + "";
	if (!groupId)
		return sn_ws_err.BadRequestError(gs.getMessage("Group id is not provided"));
	
	var ocsNG = new OnCallSecurityNG();
	if (!ocsNG.rotaMgrAccess(groupId))
		return getSecurityConstraintError();
	
	var wizardUtil = new OnCallCreationWizardUtils();
	return wizardUtil.getEscalationPanelDetails(groupId);
	
	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage(gs.getMessage("Security constraints prevent access to requested resource"));
		return respError;
	}

})(request, response);
