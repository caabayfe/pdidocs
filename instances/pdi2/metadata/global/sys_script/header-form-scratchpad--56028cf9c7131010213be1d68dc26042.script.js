(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isSecurityAdmin = gs.hasRole('security_admin');

})(current, previous);
