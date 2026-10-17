(function executeRule(current, previous /*null when async*/) {
	if (current.isValidRecord() && previous.active && !current.active) {
		current.duration = new global.NotifyDatabase().getNewParticipantDuration(current);
		current.update();
	}
})(current, previous);
