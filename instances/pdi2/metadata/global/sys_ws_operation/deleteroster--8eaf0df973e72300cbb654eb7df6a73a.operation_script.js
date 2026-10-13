(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var rosterSysId = request.body.data.roster_sys_id + "";
	if (!rosterSysId)
		return new sn_ws_err.BadRequestError("Roster id not provided");

	var rosterGr = new GlideRecord("cmn_rota_roster");
	if (rosterGr.get(rosterSysId)) {
		// only group managers and rota admin can delete the roster.
		if (new OnCallSecurityNG().rotaMgrAccess(rosterGr.rota.group + ""))
			rosterGr.deleteRecord();
		else
			return getSecurityConstraintError();
	}

	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent this operation");
		return respError;
	}

	return;

})(request, response);
