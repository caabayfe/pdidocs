(function executeRule(current, previous) {
	var cabChangeScript = new sn_change_cab.CABChangeRequest(current);
	cabChangeScript.updateDecisionforAgendaItem();
	cabChangeScript.addApprovalDecisionToMeetingNotes();
})(current, previous);
