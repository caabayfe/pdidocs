// Rename dictionary and documentation for Activity Renderer Experience Type to Layout
var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_playbook_activity_renderer');
gr.addQuery('element', 'type');
gr.query();

if(gr.next()) {
	gr.setValue('column_label', 'Layout');
	gr.update();
}

gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_playbook_activity_renderer');
gr.addQuery('element', 'type');
gr.query();

if(gr.next()) {
	gr.setValue('label', 'Layout');
	gr.setValue('plural', 'Layouts');
	gr.setValue('hint', 'An activity\'s layout');
	gr.update();
}

// Rename dictionary and documentation for Activity UI Experience Type to Layout
gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_playbook_experience_activity_ui');
gr.addQuery('element', 'experience_type');
gr.query();

if(gr.next()) {
	gr.setValue('column_label', 'Layout');
	gr.update();
}

gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_playbook_experience_activity_ui');
gr.addQuery('element', 'experience_type');
gr.query();

if(gr.next()) {
	gr.setValue('label', 'Layout');
	gr.setValue('plural', 'Layouts');
	gr.setValue('hint', 'The layout which this Activity UI applies to');
	gr.update();
}
