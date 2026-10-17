(function executeRule(current, previous /*null when async*/) {

	var time = gs.nowDateTime();
	var user = gs.getUserID();
	current.fix_at = time;
	current.fix_by = user;

})(current, previous);
