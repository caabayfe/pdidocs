var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'user_criteria');
gr.addQuery('element', 'script');
gr.setWorkflow(false);
gr.query();

while (gr.next()) {
gr.setWorkflow(false);
gr.setValue('default_value', '');
gr.update();
}
