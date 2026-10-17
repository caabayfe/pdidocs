var gr = new GlideRecord('sys_dictionary');

gr.addQuery('name', 'IN', ['sys_sg_input_attribute', 'sys_sg_variable_attribute']);
gr.query();

while (gr.next()) {
	if(gr.getValue('element') === 'value') {
		gr.setValue('mandatory', false);
		gr.update();
	}
}
