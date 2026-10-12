(function executeRule(current, previous /*null when async*/) {
	new CABAgendaItem(current).generateFutureItemNotifications();
})(current, previous);
