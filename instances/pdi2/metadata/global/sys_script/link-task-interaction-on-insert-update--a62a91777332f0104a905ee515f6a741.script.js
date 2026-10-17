(function executeRule(current, previous /*null when async*/) {
	var operation = current.operation();

	// Do not create relationship when task is assigned because
	// the interaction on the form is unlikely to be related. Save
	// the task sys_id to the client data so that the relationship
	// is also blocked on the display that follows.
	if (operation == 'update' && (current.assigned_to.changesFrom("") || current.state.changes())) {
		var session = GlideSession.get();
		session.putClientData('assigned_task', current.getUniqueValue());
		return;
	}

	var opName = operation == "insert" ? "Created" : "Updated";
	new InteractionRelationshipUtil().linkToParentInteraction(current, opName);
})(current, previous);
