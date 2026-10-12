var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_pd_trigger_execution');
gr.addQuery('element', 'pd_context');
gr.query();

if (gr.next()) {
    gr.setValue('reference_cascade_rule', 'delete');
    gr.update();
}
