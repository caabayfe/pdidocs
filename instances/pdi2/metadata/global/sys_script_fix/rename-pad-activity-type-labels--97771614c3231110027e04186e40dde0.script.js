var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_activity_type');
gr.addQuery('internal_type', 'collection');
gr.addNullQuery('element');
gr.query();

if (gr.next()) {
	gr.setValue('column_label', 'Activity UI Layout');
	gr.update();
}

gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_activity_type');
gr.addNullQuery('element');
gr.query();

if (gr.next()) {
	gr.setValue('label', 'Activity UI Layout');
	gr.setValue('plural', 'Activity UI Layouts');
	gr.update();
}

gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_activity_type_prop');
gr.addQuery('internal_type', 'collection');
gr.addNullQuery('element');
gr.query();

if (gr.next()) {
	gr.setValue('column_label', 'Experience Property');
	gr.update();
}

gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_activity_type_prop');
gr.addNullQuery('element');
gr.query();

if (gr.next()) {
	gr.setValue('label', 'Experience Property');
	gr.setValue('plural', 'Experience Properties');
	gr.update();
}
