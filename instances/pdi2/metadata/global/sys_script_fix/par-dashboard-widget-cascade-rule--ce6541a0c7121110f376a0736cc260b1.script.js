var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'par_dashboard_widget');
gr.addQuery('element', 'visualization');
gr.addNullQuery('reference_cascade_rule');
gr.query();
if (gr.next()) {
	gr.setValue('reference_cascade_rule', 'none');
	gr.update();
}
