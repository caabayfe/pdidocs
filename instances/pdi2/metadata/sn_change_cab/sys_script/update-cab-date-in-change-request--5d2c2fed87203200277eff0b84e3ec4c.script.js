
(function executeRule(current, previous /*null when async*/) {
	var cabMeeting = new sn_change_cab.CABMeeting(current);
	cabMeeting.updateCABDateInChangeRequests();
})(current, previous);
