(function executeRule(current, previous /*undefined when async or display*/) {

	if (!current.oauth2_profile.nil())
		g_scratchpad.grant_type = current.oauth2_profile.grant_type;
	else
		g_scratchpad.grant_type = current.rest_message.oauth2_profile.grant_type;

})(current, typeof previous != 'undefined' ?  previous : null);
