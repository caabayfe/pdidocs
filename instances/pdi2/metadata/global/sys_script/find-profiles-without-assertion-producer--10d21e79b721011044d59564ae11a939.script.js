(function executeRule(current, previous /*null when async*/) {

	// Get all the SAML2 grant type oauth_entity_profile(s) that are associated with current Oauth Entity 
	// and have missing SAML2 Assertion Producer reference.
	var gr = new GlideRecord("oauth_entity_profile");
	gr.initialize();
	gr.addQuery("oauth_entity", current.sys_id);
	gr.addQuery("grant_type", 'urn:ietf:params:oauth:grant-type:saml2-bearer');
	gr.addNullQuery("saml2_assertion_producer");
	gr.query();
	
	// Show a error message on top if there are 1 or more such oauth_entity_profile(s).
	if(gr.getRowCount()>0){
		var msg = gs.getMessage('Your configuration has missing SAML2 Assertion producer records in one or more entity profiles. A SAML2 Assertion producer record must be mapped to the entity profile record when grant type is SAML2 Bearer.');
		gs.addErrorMessage(msg);
	}

})(current, previous);
