(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('inbound_integration_provider_registry');
	gr.addQuery('authentication_type', 'basic_auth');
	gr.addQuery('user', current.getValue('user'));
	gr.addQuery('sys_id', '!=', current.getValue('sys_id'));
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("There is already another Integration Provider Registry record for this user"));
		current.setAbortAction(true);
	}

})(current, previous);
