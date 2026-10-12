(function executeRule(current, previous) {
	if (current.isActionAborted()) {
		return;
	}
	var gr = new GlideRecord('sys_aw_form_uiaction_layout');
	gr.addQuery('table', current.table);
	if (gs.nil(current.view))
		gr.addNullQuery('view');
	else
		gr.addQuery('view', current.view);
	if (gs.nil(current.workspace))
		gr.addNullQuery('workspace');
	else
		gr.addQuery('workspace', current.workspace);
	if (gs.nil(current.sys_domain))
		gr.addNullQuery('sys_domain');
	else
		gr.addQuery('sys_domain', current.sys_domain);
	gr.queryNoDomain();
	if (gr.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("UI Action layout already exists for this domain, table, workspace, view combination."));
		current.setAbortAction(true);
	}
})(current, previous);
