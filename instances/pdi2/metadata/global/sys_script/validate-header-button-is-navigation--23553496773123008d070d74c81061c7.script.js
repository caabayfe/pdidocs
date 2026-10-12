(function executeRule(current, previous /*null when async*/) {
	if (current.header_button.button.type != "redirection") {
		gs.addInfoMessage(gs.getMessage('Header button must be a navigation'));
		current.setAbortAction(true);
	}
})(current, previous);
