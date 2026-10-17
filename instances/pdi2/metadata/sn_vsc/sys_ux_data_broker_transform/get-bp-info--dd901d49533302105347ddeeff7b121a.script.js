function transform(input) {
	var ouput = {};
	var gr = new GlideRecord("sn_vsc_best_practice_configurations");
	gr.query('active', true);
	gr.query();
	ouput.total = gr.getRowCount();
	gr.addQuery();
	gr.query('status', 'completed');
	ouput.completed = gr.getRowCount();
	return ouput;
}
