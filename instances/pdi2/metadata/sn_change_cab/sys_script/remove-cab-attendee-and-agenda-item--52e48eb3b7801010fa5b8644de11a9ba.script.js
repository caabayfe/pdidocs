(function executeRule(current, previous /*null when async*/) {

	var cabChangeRequest = new CABChangeRequest(current);
	cabChangeRequest.updateAttendeesForAgendaItems();
	cabChangeRequest.removeCABAgendaItems();

})(current, previous);
