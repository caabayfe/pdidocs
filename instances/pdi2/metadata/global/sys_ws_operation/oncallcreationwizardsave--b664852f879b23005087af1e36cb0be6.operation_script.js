(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var step = request.body.data.step;
	var groupSysId = request.body.data.groupId;
	var ocCreationWizardUtil = new OnCallCreationWizardUtils();
	var ocsNg = new OnCallSecurityNG();

	if (!ocsNg.rotaMgrAccess(groupSysId)) {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent access to requested resource");
		return respError;
	}
	
	if (step == "define_schedule") {
		if (!groupSysId || !request.body.data.records) {
			if (!groupSysId)
				return new sn_ws_err.BadRequestError("Group Sys Id not provided in the request data");
			else
				return new sn_ws_err.BadRequestError("Shifts Information not provided in the request data");
		}	
		return ocCreationWizardUtil.createUpdateShiftFromTemplates(request.body.data.records /* shifts */, groupSysId);
	}
	else if(step == "members") {
		if (request.body.data.records) {
			return ocCreationWizardUtil.createUpdateRostersAndMembers(request.body.data.records /* rosters */);
		}
		else
			return new sn_ws_err.BadRequestError("Members data not provided in the requested data");
	} else if (step == "escalation") {
		if (request.body.data.records) {
			return ocCreationWizardUtil.saveCatchAllDetails(request.body.data.records /* escalation */);
		}
		else
			return new sn_ws_err.BadRequestError("Members data not provided in the requested data");
	}

})(request, response);
