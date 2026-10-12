(function executeRule(current, previous /*null when async*/) {
	// When a help request is cancelled, close any associated supervisor help actions
	// This ensures that supervisor actions are properly ended when they're no longer needed
  new global.InteractionHelpRequestUtil().closeSupervisorHelpAction(current.interaction);
})(current, previous);
