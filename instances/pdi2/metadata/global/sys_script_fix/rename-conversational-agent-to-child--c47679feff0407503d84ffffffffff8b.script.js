var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_activity');
gr.addQuery('element', 'conversational_agents');
gr.query();

if (gr.next()) {
	gr.setValue('column_label', 'Child Agents');
	gr.update();
}

gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_pd_activity');
gr.addQuery('element', 'conversational_agents');
gr.query();

if (gr.next()) {
	gr.setValue('label', 'Child Agents');
	gr.setValue('plural', 'Child Agents');
	gr.update();  
}
