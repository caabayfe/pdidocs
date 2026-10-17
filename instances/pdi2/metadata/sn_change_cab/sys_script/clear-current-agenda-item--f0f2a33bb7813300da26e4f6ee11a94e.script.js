(function executeRule(current, previous /*null when async*/ ) {

	CABRuntimeState.get(current.getUniqueValue()).clearCurrentAgendaItem();
	new CABMeeting(current).inProgressAgendaItemsToPending();

})(current, previous);
