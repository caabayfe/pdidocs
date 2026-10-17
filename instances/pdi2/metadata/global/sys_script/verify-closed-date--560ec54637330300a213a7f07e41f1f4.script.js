(function executeRule(current, previous) {
	if (!current.closed_at.nil() && current.opened_at.dateNumericValue() > current.closed_at.dateNumericValue()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Interaction cannot be closed before it was opened"));
	}
})(current, previous);
