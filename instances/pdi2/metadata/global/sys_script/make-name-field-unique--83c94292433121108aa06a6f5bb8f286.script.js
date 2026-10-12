(function executeRule(current, previous /*null when async*/) {
	if(!current.getValue('name'))
		return;
	var name = current.getValue('name');
	gr = new GlideRecord('sys_cs_consumer_account_context');
	gr.addQuery('name', name);
	gr.query();
	if (gr.next() ) {
		gs.addErrorMessage(gs.getMessage('Name field must be unique'));
		current.setAbortAction(true);
	}	

})(current, previous);
