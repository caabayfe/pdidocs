(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("Affected CIs added via Dynamic CI cannot be modified. CI: {0} not changed", [current.ci_item.getDisplayValue()]));
	current.setAbortAction(true);
})(current, previous);
