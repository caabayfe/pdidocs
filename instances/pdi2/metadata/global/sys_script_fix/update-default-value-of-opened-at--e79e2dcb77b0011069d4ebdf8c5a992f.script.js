var gr = new GlideRecord('sys_dictionary');

gr.addEncodedQuery('name=interaction^element=opened_at');
gr.query();

if (gr.next()) {
	gr.setValue('default_value', 'javascript:new GlideDateTime()');
	gr.setValue('dynamic_default_value', '');
    gr.setValue('use_dynamic_default', false);
	gr.update();
	gs.info('Interaction: Updated opened_at attribute default_value for interaction table through fix script.');
} else {
	gs.info('Interaction: Could not find opened_at attribute default_value for interaction table in fix script.');
}
