(function executeRule(current, previous /*null when async*/) {

	current.confirmed_at = gs.nowDateTime();
	current.confirmed_by = gs.getUserID();

})(current, previous);
