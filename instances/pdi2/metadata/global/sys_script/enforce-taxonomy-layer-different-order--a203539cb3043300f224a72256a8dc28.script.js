(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('spm_taxonomy_layer_definition');
	gr.addQuery('spm_service_portfolio', current.spm_service_portfolio);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('order', current.order);
	gr.query();
	
	// If query returns no records, exit
	if (!gr.hasNext())
		return;

	gs.addErrorMessage(gs.getMessage('There are two layer definitions with the same order value'));
	current.setAbortAction(true);

})(current, previous);
