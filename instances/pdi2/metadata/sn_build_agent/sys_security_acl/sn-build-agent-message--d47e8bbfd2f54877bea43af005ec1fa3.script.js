(function executeRule(current, previous) {
	// Write gate: create, write and delete, admin_overrides false. Same split as
	// isOwnerOrInternalAgent.js - the unattended run writes the run log of an internal
	// conversation, maint keeps read only (messageReadGate.js).
	if (gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}

	// For inserts, the message doesn't exist in the DB yet — check ownership via the conversation field on current
	if (current.isNewRecord()) {
		var insertConversationId = current.getValue('conversation');
		if (!insertConversationId) return false;
		var insertConversationGr = new GlideRecord('sn_build_agent_conversation');
		if (!insertConversationGr.get(insertConversationId)) return false;
		// Internal conversations belong to the unattended run.
		if (insertConversationGr.getValue('internal') === '1') return false;
		return insertConversationGr.user == gs.getUserID();
	}

	var messageGr = new GlideRecord('sn_build_agent_message');
	if (current.sys_id && current.getRowCount() === 1) {
		// Prevent the case where the user simply called next() before bulk operation
		messageGr.addQuery('sys_id', current.sys_id);
	} else {
		messageGr.addEncodedQuery(current.getEncodedQuery());
	}
	messageGr.query();

	// Allow if user owns the conversation that this message belongs to
	var conversationGr = new GlideRecord('sn_build_agent_conversation');
	var hasAccess = false;
	var checkedConversations = {};
	while (messageGr.next()) {
		var conversationId = messageGr.getValue('conversation');

		if (checkedConversations[conversationId]) {
			// Skip to save additional db queries
			continue;
		}

		if (conversationGr.get(conversationId)) {
			// Internal conversations belong to the unattended run.
			if (conversationGr.getValue('internal') === '1') {
				hasAccess = false;
			} else {
				hasAccess = conversationGr.user == gs.getUserID();
			}
			checkedConversations[conversationId] = true;
		} else {
			hasAccess = false;
		}
		if (!hasAccess) {
			break;
		}
	}

	return hasAccess;
})(current, previous);
