(function executeRule(current, previous) {
	// Maint can read checkpoints of internal conversations; customers can't.
	// Checkpoints of non-internal (or orphaned) conversations pass through.
	if (gs.hasRole('maint')) {
		return true;
	}
	var conversationId = current.getValue('conversation');
	if (!conversationId) {
		return true;
	}
	var conversationGr = new GlideRecord('sn_build_agent_conversation');
	if (!conversationGr.get(conversationId)) {
		return true;
	}
	return conversationGr.getValue('internal') !== '1';
})(current, previous);
