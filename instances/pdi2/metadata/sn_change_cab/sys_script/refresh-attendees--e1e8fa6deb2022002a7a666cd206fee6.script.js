(function executeRule(current, previous /*null when async*/) {

	var cabMeeting = new CABMeeting(current);
	cabMeeting.refreshBoardAttendees();

})(current, previous);
