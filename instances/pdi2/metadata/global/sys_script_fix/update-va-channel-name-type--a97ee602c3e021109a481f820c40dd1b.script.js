var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_cs_channel');
gr.addQuery('element', 'name');
gr.addQuery('internal_type', 'string');
gr.setWorkflow(false);
gr.query();
if (gr.next()) {
    gr.setValue('internal_type', 'translated_field');
    gr.update();
}
