(function executeRule(current, previous) {
	// Read and report: maint inspects internal runs, the run reads its own, customers see
	// neither. Non-internal jobs fall through to the baseline admin-only ACLs.
	if (gs.hasRole('maint') || gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}
	return current.getValue('internal') !== '1';
})(current, previous);
