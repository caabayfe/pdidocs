(function executeRule(current, previous /*null when async*/) {
	if (current.base_suite_result.number == current.number){
		gs.eventQueue("suite.completed", current, gs.getUserID(), gs.getUserName());
	}
})(current, previous);
