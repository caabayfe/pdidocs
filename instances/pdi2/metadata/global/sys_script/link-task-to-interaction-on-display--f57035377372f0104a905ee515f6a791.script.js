(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord())
		return;

	// Do not create relationship if the record was assigned in this session
	var session = GlideSession.get();
	var assignedTask = session.getClientData('assigned_task');
	session.clearClientData('assigned_task');
	if (current.getUniqueValue() == assignedTask)
		return;

	new InteractionRelationshipUtil().linkToParentInteraction(current, "Viewed");
})(current, previous);
