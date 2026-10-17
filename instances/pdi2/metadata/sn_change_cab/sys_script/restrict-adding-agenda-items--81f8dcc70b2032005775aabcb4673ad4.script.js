(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	if(!(new sn_change_cab.CABMeeting(current.cab_meeting)).canAddAgendaItem()) {
		gs.addInfoMessage(gs.getMessage("Agenda items can only be added when the meeting is in Pending state"));
		current.setAbortAction(true);
	}

})(current, previous);
