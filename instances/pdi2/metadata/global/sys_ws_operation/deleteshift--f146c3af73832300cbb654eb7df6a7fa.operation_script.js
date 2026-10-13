(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var rotaSysId = request.body.data.rota_sys_id + "";
	if (!rotaSysId)
		return new sn_ws_err.BadRequestError("Rota id not provided");

	var rotaGr = new GlideRecord("cmn_rota");
	if (rotaGr.get(rotaSysId)) {
		// only group managers and rota admin can delete the rota.
		if (new OnCallSecurityNG().rotaMgrAccess(rotaGr.group + ""))
			rotaGr.deleteRecord();
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
