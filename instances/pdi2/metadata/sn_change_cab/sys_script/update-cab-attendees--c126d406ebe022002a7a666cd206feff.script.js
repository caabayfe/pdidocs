(function executeRule(current, previous /*null when async*/) {

	var cabChangeRequest = new CABChangeRequest(current);
	cabChangeRequest.updateAttendeesForAgendaItems(previous);
	
})(current, previous);
