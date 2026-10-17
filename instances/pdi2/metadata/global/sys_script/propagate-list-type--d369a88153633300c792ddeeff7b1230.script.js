(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_atf_step');
	gr.addActiveQuery();
	gr.addQuery('test', current.test);
	// list/related list category
	gr.addQuery('step_config.category', 'bc15fe46e72a3300b5646ea8c2f6a9bf');
	gr.addQuery('order', '<', current.order);
	gr.orderByDesc('order');
	gr.setLimit(1);
	gr.query();
	if (gr.next() && gr.inputs.list_type)
		current.inputs.list_type = gr.inputs.list_type;

})(current, previous);
