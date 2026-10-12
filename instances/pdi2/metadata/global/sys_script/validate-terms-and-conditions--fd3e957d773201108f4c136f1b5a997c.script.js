(function executeRule(current, previous /* null when async */) {
	if (current.terms_and_conditions.used) {
		var errMessage = gs.getMessage('The selected terms and condition is not available. Please select another one.');
		gs.addErrorMessage(errMessage);
		current.setAbortAction(true);
	}
}(current, previous));
