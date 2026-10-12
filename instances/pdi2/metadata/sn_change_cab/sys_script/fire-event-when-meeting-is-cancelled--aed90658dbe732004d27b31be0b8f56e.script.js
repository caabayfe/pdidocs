(function executeRule(current, previous /*null when async*/) {

	new CABMeeting(current).fireEventForCancelNotification();

})(current, previous);
