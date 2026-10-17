(function executeRule(current, previous /*null when async*/) {

	var groupEscalationUtils = new OnCallGroupEscalationUtils();
	var isValidRotas = groupEscalationUtils.isValidRotas(current);
	if (!isValidRotas) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('One of the selected shift does not belong to this group'));
	}

})(current, previous);
