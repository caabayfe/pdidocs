(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	if (!gs.hasRole("security_admin")) {
		var accessRestrictedError = new sn_ws_err.ServiceError();
		accessRestrictedError.setStatus(403);
		accessRestrictedError.setMessage(gs.getMessage("Insufficent privileges to modify exclusion list"));
		response.setError(accessRestrictedError);
		
		return;
	}

	var workerId = SNC.PasswordPolicyUtil.uninstallPasswordLists();
	if (workerId == null || workerId == 'undefined')
		return new sn_ws_err.BadRequestError(gs.getMessage('password exclusion list progress worker not available'));
	
	return { "workerID": workerId };
})(request, response);
