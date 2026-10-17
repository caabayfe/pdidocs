(function executeRule(current, previous) {
	// Write gate: create, write and delete. admin_overrides is false on those ACLs, so this
	// is the whole decision. Internal rows belong to the unattended run, so its identity is
	// what writes them. Was maint; read keeps maint (conversationReadGate.js) so support can
	// still inspect what it can no longer hand-edit.
	if (gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}

	// Internal conversations are the unattended run's own - the owner can't touch them.
	if (current.getValue('internal') === '1') {
		return false;
	}

	// Otherwise allow the conversation owner.
	if (current.user == gs.getUserID()) {
		return true;
	}

	return false;
})(current, previous);
