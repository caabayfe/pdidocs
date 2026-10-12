(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_atf_step');
	gr.addActiveQuery();
	gr.addQuery('test', current.test);
	// Form step config category
	gr.addQuery('step_config.category', "3c5c4dc20b202200a8d7a12cf6673a95");
	gr.addQuery('order', '<', current.order);
	gr.orderByDesc('order');
	gr.setLimit(1);
	gr.query();
	if (gr.next() && gr.inputs.form_ui)
		current.inputs.form_ui = gr.inputs.form_ui;

})(current, previous);
