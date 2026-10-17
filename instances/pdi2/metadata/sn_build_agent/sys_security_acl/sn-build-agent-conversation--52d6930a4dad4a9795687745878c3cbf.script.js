(function executeRule(current, previous) {
	// Read gate. maint keeps internal reads even though it lost internal writes
	// (isOwnerOrInternalAgent.js): inspecting a run is support work, mutating one is not.
	// admin_overrides is true here, so this branch is for a maint engineer without admin.
	if (gs.hasRole('maint') || gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}

	// Internal conversations are not the customer's to see, even their owner's.
	if (current.getValue('internal') === '1') {
		return false;
	}

	if (current.user == gs.getUserID()) {
		return true;
	}

	return false;
})(current, previous);
