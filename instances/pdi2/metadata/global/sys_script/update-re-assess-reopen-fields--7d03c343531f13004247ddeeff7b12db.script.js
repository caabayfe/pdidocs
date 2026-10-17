(function executeRule(current, previous /*null when async*/) {

	current.reopened_at = new GlideDateTime();
	current.reopened_by = gs.getUserID();
	current.reopen_count = current.reopen_count + 1;
	
	//clear other fields populated at this point
	current.started_at = '';
	current.started_by = '';
	current.closed_at = '';
	current.closed_by = '';
	current.close_code = '';
	current.close_notes = '';
	
})(current, previous);
