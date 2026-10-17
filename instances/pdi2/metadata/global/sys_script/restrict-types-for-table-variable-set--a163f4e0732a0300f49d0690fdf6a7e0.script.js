(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("'{0}' variable cannot be part of multi-row variable set", [current.getDisplayValue('type')]));
	current.setAbortAction(true);
})(current, previous);
