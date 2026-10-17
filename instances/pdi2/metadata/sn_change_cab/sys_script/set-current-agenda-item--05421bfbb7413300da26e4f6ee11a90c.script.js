(function executeRule(current, previous /*null when async*/ ) {

	new CABMeeting(current).firstPendingAgendaItemToInProgress();
	
})(current, previous);
