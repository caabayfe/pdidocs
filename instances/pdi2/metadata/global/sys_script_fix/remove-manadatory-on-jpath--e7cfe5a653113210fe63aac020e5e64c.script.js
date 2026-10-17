var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_data_source');
gr.addQuery('element', 'jpath_root_node');
gr.query();

if (gr.next()){
	gr.setValue('mandatory', false);
	gr.update();
}
