var date = new GlideDateTime().getDate();
if (current.start_date > date) {
    current.start_date.setError(gs.getMessage(' Employment start date cannot be a future date'));
    current.setAbortAction(true);
}
if (!current.start_date.nil() && !current.end_date.nil() && current.start_date > current.end_date) {
    current.end_date.setError(gs.getMessage('Employment end date must be after Employment start date'));
    current.setAbortAction(true);
}
