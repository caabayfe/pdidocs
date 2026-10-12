(function executeRule(current, previous /*null when async*/) {

	if(current.jwks_url) {
		var oidcProviderTester = new SNC.OIDCProviderTester();
		if(!oidcProviderTester.isValidURL(current.jwks_url)) {
			gs.addErrorMessage(gs.getMessage("Please provide a valid URL. Refer documentation for more details."));
			current.setAbortAction(true);
		}
	}

})(current, previous);
