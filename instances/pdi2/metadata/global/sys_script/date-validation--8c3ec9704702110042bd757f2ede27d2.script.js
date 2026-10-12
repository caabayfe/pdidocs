if (!current.start_date.nil() && !current.end_date.nil() && current.start_date > current.end_date) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("The start date cannot be after the end date"));
}
