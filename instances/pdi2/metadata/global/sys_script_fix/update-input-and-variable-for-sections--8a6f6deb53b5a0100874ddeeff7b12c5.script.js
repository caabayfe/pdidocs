function updateParameterRecordsForSections() {
	var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', "IN", 'sys_sg_input, sys_sg_variable');
    gr.addQuery('element', 'parameter_screen');
    gr.query();
    while (gr.next()) {
		gr.setValue('mandatory', false);
		gr.setValue('read_only', false);
		gr.setWorkflow(false);
		gr.update();
	}
}

updateParameterRecordsForSections();
