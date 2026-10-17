(function executeRule(current, previous /*null when async*/) {
	var db = new NotifyDatabase();
	var confGR = current.notify_conference_call.getRefRecord();
	if(db.canMakeConferenceCallInActive(confGR))
		db.setConferenceCallActiveState(confGR, false);
	else
		db.setConferenceCallActiveState(confGR, true);
})(current, previous);
