(function executeRule(current, previous) {
	// maint reads internal conversations and so does the unattended run that owns them;
	// customers can't. Non-internal reads pass through.
	if (gs.hasRole('maint') || gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}
	return current.getValue('internal') !== '1';
})(current, previous);
