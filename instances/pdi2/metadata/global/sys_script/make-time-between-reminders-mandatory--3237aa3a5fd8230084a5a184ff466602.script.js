(function executeRule(current, previous /*null when async*/) {

	if (current.reminders && current.reminders > 0 && !current.time_between_reminders) {
		var message = gs.getMessage('Time between reminders is mandatory when number of reminders is set');
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
})(current, previous);
