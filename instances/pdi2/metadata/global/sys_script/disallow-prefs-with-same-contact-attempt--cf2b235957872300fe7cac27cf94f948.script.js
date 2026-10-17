(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('cmn_rota_contact_preference');
	gr.addQuery('type', current.type);
	gr.addQuery('contact_attempt', current.contact_attempt);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	if (current.type == 'escalation_set')
		gr.addQuery('cmn_rota_escalation_set', current.cmn_rota_escalation_set + '');
	else
		gr.addQuery('cmn_rota', current.cmn_rota + '');
	gr.query();
	
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Contact preference set with contact attempt - {0} already exists', current.contact_attempt));
		current.setAbortAction(true);
	}

})(current, previous);
