(function executeRule(current, previous /*null when async*/) {

	current.started_at = new GlideDateTime();
	current.started_by = gs.getUserID();

})(current, previous);
