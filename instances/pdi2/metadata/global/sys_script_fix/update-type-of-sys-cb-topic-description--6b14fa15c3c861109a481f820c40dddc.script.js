var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_cb_topic');
gr.addQuery('element', 'description');
gr.addQuery('internal_type', 'string');
gr.setWorkflow(false);
gr.query();
if (gr.next()) {
    gr.setValue('internal_type', 'translated_text');
    gr.update();
}
