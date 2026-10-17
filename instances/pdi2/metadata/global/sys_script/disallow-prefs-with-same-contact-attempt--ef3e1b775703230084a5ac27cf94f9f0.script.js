(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('on_call_user_contact_preference');
	gr.addQuery('on_call_user_preference', current.on_call_user_preference + '');
	gr.addQuery('contact_attempt', current.contact_attempt);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Contact preference with contact attempt - {0} already exists', current.contact_attempt));
		current.setAbortAction(true);
	}

})(current, previous);
