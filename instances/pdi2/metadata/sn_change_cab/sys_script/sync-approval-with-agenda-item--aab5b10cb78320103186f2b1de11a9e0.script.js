(function executeRule(current, previous) {
	var decisionValue = current.getValue("approval") === "not requested" ? "rejected" : null;
	var decisionDisplayValue = decisionValue === "rejected" ? gs.getMessage("rejected") : null;

	var cabChangeScript = new sn_change_cab.CABChangeRequest(current);
	cabChangeScript.updateDecisionforAgendaItem(decisionValue);
	cabChangeScript.addApprovalDecisionToMeetingNotes(decisionDisplayValue);
})(current, previous);
