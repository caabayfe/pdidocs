var gr = new GlideRecord('pa_dimensions');
gr.addQuery('manual_breakdown', current.sys_id);	
gr.query();
if (!gr.next()) {
	gr.initialize();
	gr.setValue('sys_scope', current.sys_scope);
	gr.setValue('name', current.name);
	gr.setValue('manual_breakdown', current.sys_id);
	gr.setValue('facts_table', 'pa_manual_breakdowns');
	gr.setValue('conditions', 'breakdown=' + current.sys_id);
	gr.insert();
} else {
	gr.setValue('name', current.name);
	gr.update();
}
current.dimension=gr.sys_id;
