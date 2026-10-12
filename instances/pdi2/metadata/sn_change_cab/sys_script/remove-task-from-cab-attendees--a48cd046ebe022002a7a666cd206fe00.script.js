(function executeRule(current, previous /*null when async*/) {

	var agendaItem = new CABAgendaItem(current);
	agendaItem.removeTaskFromAttendees();

})(current, previous);
