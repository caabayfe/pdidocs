(function executeRule(current, previous /*null when async*/) {
	// Allow overriding current state if interaction was agent ended
	if (previous.state_reason != "agent_ended" && current.state_reason == "agent_ended")
		return;

	gs.addInfoMessage(gs.getMessage("An interaction may not be re-opened once it has been closed."));
	current.setAbortAction(true);
})(current, previous);
