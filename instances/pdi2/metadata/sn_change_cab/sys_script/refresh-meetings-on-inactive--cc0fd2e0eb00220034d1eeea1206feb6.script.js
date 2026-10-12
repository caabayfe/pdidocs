(function executeRule(current, previous /*null when async*/) {
	new CABDefinition(current).refreshMeetings();
})(current, previous);
