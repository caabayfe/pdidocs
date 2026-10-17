//This clears the unauthorised field if it has been set on change request if the outage is of any type except 'planned'
(function executeRule(current, previous /*null when async*/) {
	var chgGr = current.task.getRefRecord();
	chgGr.setValue('unauthorized', false);
	chgGr.update();
})(current, previous);
