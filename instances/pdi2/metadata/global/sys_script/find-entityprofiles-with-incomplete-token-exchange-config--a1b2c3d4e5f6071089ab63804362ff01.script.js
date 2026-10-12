(function executeRule(current, previous /*null when async*/) {
	// Get all Token Exchange type oauth_entity_profile(s) associated with current OAuth Entity that have missing token_source.
	var gr = new GlideRecord("oauth_entity_profile");
	gr.initialize();
	gr.addQuery("oauth_entity", current.sys_id);
	gr.addQuery("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
	var qc = gr.addNullQuery("token_source");
	qc.addOrCondition("token_source", "");
	gr.query();
	if (gr.next()) {
		var profiles = [gr.name + ''];
		while (gr.next()) {
			profiles.push(gr.name + '');
		}
		var msg = gs.getMessage('Your configuration has missing token source in one or more entity profiles : {0}. A token source must be configured on the entity profile record when grant type is Token Exchange.', profiles.join(", "));
		gs.addErrorMessage(msg);
		return;
	}

	// Get Token Exchange profiles where token_source is jwt_provider but jwt_provider is not set.
	var grJwt = new GlideRecord("oauth_entity_profile");
	grJwt.initialize();
	grJwt.addQuery("oauth_entity", current.sys_id);
	grJwt.addQuery("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
	grJwt.addQuery("token_source", "jwt_provider");
	grJwt.addNullQuery("jwt_provider");
	grJwt.query();
	if (grJwt.next()) {
		var jwtProfiles = [grJwt.name + ''];
		while (grJwt.next()) {
			jwtProfiles.push(grJwt.name + '');
		}
		var jwtMsg = gs.getMessage('Your configuration has missing JWT provider records in one or more token exchange entity profiles : {0}. A JWT provider record must be mapped to the entity profile record when token source is JWT Provider.', jwtProfiles.join(", "));
		gs.addErrorMessage(jwtMsg);
	}

	// Get Token Exchange profiles where token_source is oauth_profile but token_source_profile is not set.
	var grProfile = new GlideRecord("oauth_entity_profile");
	grProfile.initialize();
	grProfile.addQuery("oauth_entity", current.sys_id);
	grProfile.addQuery("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
	grProfile.addQuery("token_source", "oauth_profile");
	grProfile.addNullQuery("token_source_profile");
	grProfile.query();
	if (grProfile.next()) {
		var oauthProfiles = [grProfile.name + ''];
		while (grProfile.next()) {
			oauthProfiles.push(grProfile.name + '');
		}
		var profileMsg = gs.getMessage('Your configuration has missing token source profile in one or more token exchange entity profiles : {0}. A token source profile must be mapped to the entity profile record when token source is OAuth Profile.', oauthProfiles.join(", "));
		gs.addErrorMessage(profileMsg);
	}
})(current, previous);
