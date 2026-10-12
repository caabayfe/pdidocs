(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage('Cannot update field "App Shell UI" when "Admin panel" contains a UX App Configuration'));
	current.setAbortAction(true);
})(current, previous);
