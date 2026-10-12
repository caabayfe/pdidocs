(function executeRule(current, previous) {
	// Allow if user has maint role
	if (gs.hasRole('maint')) {
		return true;
	}

	// For inserts, the checkpoint doesn't exist in the DB yet — check ownership via the conversation field on current
	if (current.isNewRecord()) {
		var insertConversationId = current.getValue('conversation');
		if (!insertConversationId) return false;
		var insertConversationGr = new GlideRecord('sn_build_agent_conversation');
		if (!insertConversationGr.get(insertConversationId)) return false;
		// Internal conversations are maint-only.
		if (insertConversationGr.getValue('internal') === '1') return false;
		return insertConversationGr.user == gs.getUserID();
	}

	var checkpointGr = new GlideRecord('sn_build_agent_checkpoint');
	if (current.sys_id && current.getRowCount() === 1) {
		// Prevent the case where the user simply called next() before bulk operation
		checkpointGr.addQuery('sys_id', current.sys_id);
	} else {
		checkpointGr.addEncodedQuery(current.getEncodedQuery());
	}
	checkpointGr.query();

	// Allow if user owns the conversation that this checkpoint belongs to
	var conversationGr = new GlideRecord('sn_build_agent_conversation');
	var hasAccess = false;
	var checkedConversations = {};
	while (checkpointGr.next()) {
		var conversationId = checkpointGr.getValue('conversation');

		if (checkedConversations[conversationId]) {
			// Skip to save additional db queries
			continue;
		}

		if (conversationGr.get(conversationId)) {
			// Internal conversations are maint-only.
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
