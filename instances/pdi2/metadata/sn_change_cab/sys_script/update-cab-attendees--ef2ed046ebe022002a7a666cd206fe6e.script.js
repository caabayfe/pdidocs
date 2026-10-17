(function executeRule(current, previous /*null when async*/) {
	var agendaItem;
	if (!previous.task.nil()) {
		agendaItem = new CABAgendaItem(previous);
		agendaItem.removeAttendees();
	}

	if (!current.task.nil()) {
		agendaItem = new CABAgendaItem(current);
		agendaItem.refreshAttendees();
	}
	
})(current, previous);
