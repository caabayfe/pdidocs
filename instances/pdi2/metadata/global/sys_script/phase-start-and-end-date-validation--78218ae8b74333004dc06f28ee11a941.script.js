function validatePhaseStartEndDates() {
	if (gs.dateDiff(current.end_date.getDisplayValue(), current.start_date.getDisplayValue(), true) <= 0)
		return;

	var message = gs.getMessage('{0} must be after {1}', [current.end_date.getLabel(), current.start_date.getLabel()]);
	gs.addErrorMessage(message);

	current.setAbortAction(true);
}
validatePhaseStartEndDates();
