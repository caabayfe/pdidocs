(function executeRule(current, previous /*null when async*/) {
	//Populate the alotted time from the meeting if associated to one
	if (current.getValue('cab_meeting')) {
		var meeting = current.cab_meeting.getRefRecord();
		current.setValue('alotted_time', meeting.getValue('time_per_agenda_item'));
	}
})(current, previous);
