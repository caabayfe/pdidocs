(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("Affected CIs cannot be modified for Change Requests in this state. CI: {0} not associated", [current.ci_item.getDisplayValue()]));
	current.setAbortAction(true);
})(current, previous);
