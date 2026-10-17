(function executeRule(current, previous) {
	// maint reads the messages of internal conversations and so does the unattended run
	// that owns them; customers can't. Messages of non-internal (or orphaned)
	// conversations pass through.
	if (gs.hasRole('maint') || gs.hasRole('sn_build_agent.internal_agent')) {
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
