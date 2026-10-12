(function executeRule(current, previous /*undefined when async or display*/ ) {
	if (!new StdChangeUtils().reviewedFieldsAcl(current)) {
		gs.addErrorMessage(gs.getMessage(
			"Template Value cannot be modified for the current proposal, as the proposal is 'Closed', 'Cancelled' or '{0}' user does not have access to modify the template value.",
			gs.getUserName()));
		current.setAbortAction(true);
	}
})(current, typeof previous !== 'undefined' ? previous : null);
