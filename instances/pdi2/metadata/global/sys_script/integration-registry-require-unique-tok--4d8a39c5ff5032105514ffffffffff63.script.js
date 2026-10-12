(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('inbound_integration_provider_registry');
	gr.addQuery('authentication_type', 'token_credential');
	gr.addQuery('token_credential', current.getValue('token_credential'));
	gr.addQuery('sys_id', '!=', current.getValue('sys_id'));
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("There is already another Integration Provider Registry record for this Token Credential"));
		current.setAbortAction(true);
	}

})(current, previous);
