(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var rotaId = request.queryParams.rota_id ? request.queryParams.rota_id + "" : "";
	if (!rotaId) {
		return new sn_ws_err.BadRequestError("Rota id not provided");
	}
	
	var rotaGr = new GlideRecord("cmn_rota");
	if (rotaGr.get(rotaId)) {
		// only group managers and rota admin can delete the rota.
		if (new OnCallSecurityNG().rotaMgrAccess(rotaGr.group + ""))
			overrideEscalation();
		else
			return getSecurityConstraintError();
	}

	function getSecurityConstraintError() {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent this operation");
		return respError;
	}
	
	function overrideEscalation() {
		var ocWorkbenchUtils = new OnCallWorkbenchUtils();
		ocWorkbenchUtils.overrideEscalation(rotaId);
		return;
	}
})(request, response);
