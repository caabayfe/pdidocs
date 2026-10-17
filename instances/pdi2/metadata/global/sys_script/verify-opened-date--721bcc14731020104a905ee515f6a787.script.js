(function executeRule(current, previous) {
	if (current.opened_at.dateNumericValue() > new GlideDateTime().getNumericValue()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Interaction can not be opened in the future"));
	}
})(current, previous);
