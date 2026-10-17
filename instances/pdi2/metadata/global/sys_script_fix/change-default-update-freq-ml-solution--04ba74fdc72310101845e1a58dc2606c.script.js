var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'ml_solution');
gr.addQuery('element', 'update_frequency');
gr.query();
if (gr.next()) {
	gr.setValue('default_value', 'do_not_update');
	gr.update();
}
