if (!current.employment_start_date.nil() && !current.employment_end_date.nil() && current.employment_start_date > current.employment_end_date) {
	current.employment_end_date.setError(gs.getMessage('Employment end date must be after Employment start date'));
	current.setAbortAction(true);
}
