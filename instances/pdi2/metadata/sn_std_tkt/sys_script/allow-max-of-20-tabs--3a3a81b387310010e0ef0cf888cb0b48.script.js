(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('ticket_tab_configuration');
	gr.addQuery('parent', current.parent);
	gr.query();
	if (gr.getRowCount() >= 20) {
		gs.addErrorMessage(gs.getMessage('You have reached maximum number of tabs for {0}', current.table));
		current.setAbortAction(true);
	}

})(current, previous);
