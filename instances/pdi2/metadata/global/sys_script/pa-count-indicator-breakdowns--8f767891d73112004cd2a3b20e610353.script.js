(function executeRule(current, previous /*null when async*/) {
	if (current.type != 1)
		return ;
	if (!current.collect_breakdown_matrix)
		return;
	
	gr = new GlideRecord('pa_indicator_breakdowns');
	gr.addQuery('indicator', current.sys_id);
	gr.query();
	
	g_scratchpad.pa_indicator_breakdown_count = gr.getRowCount();

})(current, previous);
