function setReadOnlyFalse(field) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'sam_sw_product_lifecycle');
	gr.addQuery('element', field);
	gr.addQuery('read_only', 'true');
	gr.query();

	if (gr.next()) {
		gr.setValue('read_only', 'false');
		gr.setWorkflow(false);
		gr.update();
	}
}
setReadOnlyFalse('publisher');
setReadOnlyFalse('product_name');
