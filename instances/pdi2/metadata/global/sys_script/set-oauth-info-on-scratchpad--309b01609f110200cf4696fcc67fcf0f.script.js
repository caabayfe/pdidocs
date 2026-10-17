(function executeRule(current, previous /*undefined when async or display*/) {

	// current record
	g_scratchpad.oauth_provider_id = current.oauth2_profile.oauth_entity;
	g_scratchpad.grant_type = current.oauth2_profile.grant_type;
	g_scratchpad.use_same_mid_for_auth = gs.getProperty('glide.rest.outbound.oauth.use_same_mid_for_auth', 'false');
	
	// parent record
	g_scratchpad.rm_oauth_provider_id = current.rest_message.oauth2_profile.oauth_entity;
	g_scratchpad.rm_grant_type = current.rest_message.oauth2_profile.grant_type;
	g_scratchpad.rm_authentication_type = current.rest_message.authentication_type;
	g_scratchpad.rm_oauth2_profile = current.rest_message.oauth2_profile;
	g_scratchpad.rm_sys_id = current.rest_message.sys_id;
	
})(current, typeof previous != 'undefined' ?  previous : null);
