(function executeRule(current, previous) {
	// Read gate. maint keeps internal reads so support can inspect a run's messages; writes
	// moved to the run's identity (isMessageOwnerOrInternalAgent.js).
	if (gs.hasRole('maint') || gs.hasRole('sn_build_agent.internal_agent')) {
		return true;
	}

	if (current.isNewRecord()) {
		var insertConversationId = current.getValue('conversation');
		if (!insertConversationId) return false;
		var insertConversationGr = new GlideRecord('sn_build_agent_conversation');
		if (!insertConversationGr.get(insertConversationId)) return false;
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

	var conversationGr = new GlideRecord('sn_build_agent_conversation');
	var hasAccess = false;
	var checkedConversations = {};
	while (messageGr.next()) {
		var conversationId = messageGr.getValue('conversation');

		if (checkedConversations[conversationId]) {
			continue;
		}

		if (conversationGr.get(conversationId)) {
			// Internal conversations are not the customer's to see.
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
