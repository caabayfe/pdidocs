(function executeRule(current, previous /*null when async*/) {
	// Get all the JWT type oauth_entity_profile(s) which are associated with current Oauth Entity and have missing JWT Provider reference.
	var gr = new GlideRecord("oauth_entity_profile");
	gr.initialize();
	gr.addQuery("oauth_entity", current.sys_id);
	gr.addQuery("grant_type", 'urn:ietf:params:oauth:grant-type:jwt-bearer');
	gr.addNullQuery("jwt_provider");
	gr.query();
	// Show a error message on top if there are 1 or more such oauth_entity_profile(s).
	if (gr.next()) {
		var oauthEntityProfiles = [gr.name + ''];
		while(gr.next()) {
            oauthEntityProfiles.push(gr.name + '');
		}
		var msg = gs.getMessage('Your configuration has missing JWT provider records in one or more entity profiles : ') 
					+ oauthEntityProfiles.join(", ") 
					+ ". " 
					+ gs.getMessage('A JWT provider record must be mapped to the entity profile record when grant type is JWT Bearer.');
		gs.addErrorMessage(msg);
	}
})(current, previous);
