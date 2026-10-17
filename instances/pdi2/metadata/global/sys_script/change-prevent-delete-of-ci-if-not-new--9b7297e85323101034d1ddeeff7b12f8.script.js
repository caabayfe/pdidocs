(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("Affected CIs cannot be removed for in-progress Change Requests. CI: {0} left unchanged", [current.ci_item.getDisplayValue()]));
	current.setAbortAction(true);
})(current, previous);
