(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('inbound_integration_provider_registry');
	gr.addQuery('authentication_type', 'oauth');
	gr.addQuery('oauth_entity', current.getValue('oauth_entity'));
	gr.addQuery('sys_id', '!=', current.getValue('sys_id'));
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("There is already another Integration Provider Registry record for this OAuth Entity"));
		current.setAbortAction(true);
	}

})(current, previous);
