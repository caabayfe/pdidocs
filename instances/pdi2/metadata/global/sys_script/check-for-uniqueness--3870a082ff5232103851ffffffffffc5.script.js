(function executeRule(current, previous /*null when async*/) {

	var cimdHelper = new global.CIMDMetadataHelper();

	// checking if client id is indeed unique
	var uniquenessResult = cimdHelper.validateClientIdUniqueness(current);
	if (!uniquenessResult.success) {
        gs.addErrorMessage(uniquenessResult.error_msg);
        current.setAbortAction(true);
        return;
    }

	// lets see if manual status has redirect url pointing to localhost when localhost redirection is not allowed
	var localhostResult = cimdHelper.validateRedirectUrlForLocalhost(current);
	if (!localhostResult.success) {
        gs.addErrorMessage(localhostResult.error_msg);
        current.setAbortAction(true);
        return;
    }

	var response = cimdHelper.fetchCIMDMetadata(current.client_id);

	if (response.success === true)
		return;
	
	if (response.error_msg)
		gs.addErrorMessage(gs.getMessage("Failed to reach or validate CIMD. Detailed error: {0}", response.error_msg));
	else
		gs.addErrorMessage(gs.getMessage("Failed to reach or validate CIMD"));
	
	current.setAbortAction(true);
	


	// Add your code here

})(current, previous);
