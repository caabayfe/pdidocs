(function executeRule(current, previous /*undefined when async or display*/) {
	
	g_scratchpad.oauth_provider_id = current.oauth2_profile.oauth_entity;
	g_scratchpad.grant_type = String(current.oauth2_profile.grant_type);
	
})(current, typeof previous != 'undefined' ?  previous : null);
