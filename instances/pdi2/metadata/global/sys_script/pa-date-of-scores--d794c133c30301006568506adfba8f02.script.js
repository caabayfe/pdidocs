current.start_at = SNC.PAScore.normalizeStartAt(current.indicator, current.start_at);
if (current.start_at && current.start_at.getDisplayValue() === '') {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Invalid date"));
}
