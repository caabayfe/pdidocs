(function executeRule(current, previous /*null when async*/ ) {

	gs.addErrorMessage(gs.getMessage('An identical mapping for the Order or SLA definition already exists in this table. Specify a different Order or SLA definition to create or update a mapping'));
	current.setAbortAction(true);

})(current, previous);
