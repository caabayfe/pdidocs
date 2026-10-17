(function executeRule(current, previous /*null when async*/) {
	new CABAgendaItem(current, gs).addDecisionToMeetingNotes();
})(current, previous);
