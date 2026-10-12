(function executeRule(current, previous) {
	// Write and delete, admin_overrides false: only the unattended run mutates its own job.
	// Non-internal jobs fall through to the baseline admin-only ACLs. Was maint; read keeps
	// it (jobInternalReadGate.js).
	if (gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}
	return current.getValue('internal') !== '1';
})(current, previous);
