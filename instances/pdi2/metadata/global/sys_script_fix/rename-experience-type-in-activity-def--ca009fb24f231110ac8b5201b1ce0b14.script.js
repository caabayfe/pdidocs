var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_activity_definition');
gr.addQuery('internal_type', 'reference');
gr.addQuery('element', 'activity_type');
gr.query();
if (gr.next()) {
	gr.setValue('column_label', 'UI Layout');
	gr.update();
}
gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_activity_definition');
gr.addQuery('element', 'activity_type');
gr.query();
if (gr.next()) {
	gr.setValue('label', 'UI Layout');
	gr.setValue('plural', 'UI Layouts');
	gr.update();
}
