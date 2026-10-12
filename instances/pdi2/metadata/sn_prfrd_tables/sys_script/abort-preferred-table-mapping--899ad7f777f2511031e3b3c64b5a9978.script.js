(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sn_preferred_table_context_mapping');
	gr.addQuery('preferred_table', current.preferred_table);
	gr.addQuery('context', current.context);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if(gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Preferred table and context mapping already exist.'));
	}
})(current, previous);
