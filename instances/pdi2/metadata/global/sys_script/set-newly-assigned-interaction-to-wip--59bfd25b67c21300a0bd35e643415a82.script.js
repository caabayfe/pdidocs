(function executeRule(current, previous /*null when async*/) {
	/**
 	 * If a 'new', 'pending_accept', or 'queued' record becomes assigned to a user, set it to
	 * 'work_in_progress'.
	 */
	current.state = 'work_in_progress';
})(current, previous);
