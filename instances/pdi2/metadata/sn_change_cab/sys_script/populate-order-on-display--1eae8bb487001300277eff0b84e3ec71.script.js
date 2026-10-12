(function executeRule(current, previous /*null when async*/) {

	var cabMeeting = new CABMeeting(current.cab_meeting.getRefRecord());
	current.order = cabMeeting.getNextOrder();

})(current, previous);
