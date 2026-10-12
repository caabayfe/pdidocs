// Change process type table label
gr = new GlideRecord('sys_db_object');
gr.addQuery('name', 'sys_pd_process_type');
gr.query();
if (gr.next()) {
	gr.setValue('label', 'Playbook Type');
	gr.update();
}
gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_process_type');
gr.query();
if (gr.next()) {
	gr.setValue('label', 'Playbook Type');
	gr.setValue('plural', 'Playbook Types');
	gr.update();
}
gr = new GlideRecord('sys_app_module');
gr.addQuery('name', 'sys_pd_process_type');
gr.query();
if (gr.next()) {
	gr.setValue('sys_name', 'Playbook Type');
	gr.update();
}

// Change process type label in panel override table
gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_panel_override');
gr.addQuery('element', 'process_type');
gr.query();
if (gr.next()) {
	gr.setValue('column_label', 'Playbook type');
	gr.update();
}
gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_panel_override');
gr.addQuery('element', 'process_type');
gr.query();
if (gr.next()) {
	gr.setValue('label', 'Playbook type');
	gr.setValue('plural', 'Playbook types');
	gr.update();
}

// Change process type label in process definition table
gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_process_definition');
gr.addQuery('element', 'process_type');
gr.query();
if (gr.next()) {
	gr.setValue('column_label', 'Playbook type');
	gr.update();
}
gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_process_definition');
gr.addQuery('element', 'process_type');
gr.query();
if (gr.next()) {
	gr.setValue('label', 'Playbook type');
	gr.setValue('plural', 'Playbook types');
	gr.update();
}
