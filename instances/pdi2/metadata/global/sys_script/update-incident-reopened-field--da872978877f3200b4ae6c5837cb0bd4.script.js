(function executeRule(current, previous /*null when async*/) {

	if(current.isValidField("reopened_time"))
		current.reopened_time = gs.nowDateTime();
	
	if(current.isValidField("reopened_by"))
		current.reopened_by = gs.getUserID();

})(current, previous);
