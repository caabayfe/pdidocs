(function executeRule(current, previous /*null when async*/) {
	// Look up all in progress agenda items and set as complete/no decision
	var aiGr = new GlideRecord(CAB.AGENDA_ITEM);
	aiGr.addQuery(CAB.MEETING, current.getUniqueValue());
	aiGr.addQuery("state", "IN", "pending, in_progress");
	aiGr.query();
	
	while (aiGr.next()) {
		var ai = new CABAgendaItem(aiGr);
		if (ai.isDecisionPending())
			ai.noDecision();
		else
			ai.complete();
	}
	
	// Call the endMeeting method for the appropriate runtimeState record
	var runtimeState = CABRuntimeState.get(current.getUniqueValue());
	runtimeState.endMeeting();

})(current, previous);
