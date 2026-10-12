(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("Affected CIs cannot be created for in-progress Change Requests. CI: {0} not associated", [current.ci_item.getDisplayValue()]));
	current.setAbortAction(true);
})(current, previous);
