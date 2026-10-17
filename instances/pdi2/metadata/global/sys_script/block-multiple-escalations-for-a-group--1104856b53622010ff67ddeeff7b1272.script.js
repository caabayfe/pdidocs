(function executeRule(current, previous /*null when async*/) {

	var groupEscalationUtils = new OnCallGroupEscalationUtils();
	var hasAnotherEscalation = groupEscalationUtils.hasAnotherEscalation(current);
	if (hasAnotherEscalation) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('This group already has an escalation policy defined'));
	}

})(current, previous);
