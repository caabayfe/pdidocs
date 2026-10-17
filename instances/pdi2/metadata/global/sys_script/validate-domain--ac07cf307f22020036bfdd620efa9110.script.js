(function executeRule(current, previous /*null when async*/) {
    var domain = current.getValue("domain");
    var supportsWildCardDomain = current.use_resource_path;
	var allowsCredentials = current.access_control_allow_credentials;
	var errorMessage = new RESTUtils().validateCORSDomain(domain, supportsWildCardDomain, allowsCredentials);
	if (errorMessage != null) {
		gs.addErrorMessage(errorMessage);
        current.setAbortAction(true);
	}
})(current, previous);
