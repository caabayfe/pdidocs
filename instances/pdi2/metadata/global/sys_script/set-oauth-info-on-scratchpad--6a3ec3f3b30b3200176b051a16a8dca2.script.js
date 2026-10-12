(function executeRule(current, previous /*undefined when async or display*/) {
	
	g_scratchpad.oauth_provider_id = current.oauth_entity_profile.oauth_entity;
	g_scratchpad.grant_type = String(current.oauth_entity_profile.grant_type);
	g_scratchpad.integration_type = String(current.integration_type);
	g_scratchpad.use_mid = current.use_mid;
	
})(current, typeof previous != 'undefined' ?  previous : null);
