(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.ucEnabled = pm.isActive('com.glide.ux.user_criteria') && gs.getProperty('glide.ux.user_criteria_enabled', false) ;

})(current, previous);
