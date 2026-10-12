(function executeRule(current, previous /*null when async*/) {
	// Close any associated supervisor help actions when an interaction is closed or reassigned
	// This ensures that supervisor actions are properly ended and tracked
	new global.InteractionHelpRequestUtil().closeSupervisorHelpAction(current.getUniqueValue());
})(current, previous);
