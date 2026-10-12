(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.use_user_criteria = gs.getProperty('glide.service_portal.user_criteria_enabled', 'false') === 'true';
})(current, previous);
