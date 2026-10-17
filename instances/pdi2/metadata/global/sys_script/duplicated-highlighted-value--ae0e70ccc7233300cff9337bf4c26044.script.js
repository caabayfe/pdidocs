(function executeRule(current, previous) {
	// this business rule prevents someone tries to bypass ui form and use GlideRecord directly to
	// insert duplicated entry of sys_highlighted_value. Even though there's a unique index of 
	// talbe+field+workspace on the table, but the uniqueness is only enforced when workspace
	// is not blank. So we need to take care of the unique empty workspace record ouself
	
	var gr = new GlideRecord('sys_highlighted_value');
	gr.addQuery('table', current.getValue('table'));
	gr.addQuery('field', current.getValue('field'));
	gr.addNullQuery('workspace');
	gr.query();
	if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage("There is already an entry for the table, field and workspace combination you have selected"));
		current.setAbortAction(true);
	}
})(current, previous);
