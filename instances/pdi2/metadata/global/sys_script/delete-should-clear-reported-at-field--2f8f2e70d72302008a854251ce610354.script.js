var gr = new GlideRecord('pa_cubes');
gr.addQuery('report_source', current.sys_id);
gr.query();
while (gr.next()) {
	gr.setValue('report_source_updated_at', '');
	gr.update();
}
