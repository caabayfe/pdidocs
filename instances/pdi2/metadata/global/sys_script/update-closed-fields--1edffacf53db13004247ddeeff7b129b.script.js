(function executeRule(current, previous /*null when async*/) {

	current.closed_at = new GlideDateTime();
	current.closed_by = gs.getUserID();

})(current, previous);
