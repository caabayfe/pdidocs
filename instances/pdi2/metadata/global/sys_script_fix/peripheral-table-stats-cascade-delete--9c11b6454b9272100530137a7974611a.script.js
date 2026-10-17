(function() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'sys_peripheral_table_stats');
	gr.addQuery('element', 'physical_table_stats_id');
	gr.addNullQuery('reference_cascade_rule');
	gr.setWorkflow(false);
	gr.query();
	if (gr.next()) {
		gr.setValue('reference_cascade_rule', 'delete');
		gr.update();
	}
    return;
})();
