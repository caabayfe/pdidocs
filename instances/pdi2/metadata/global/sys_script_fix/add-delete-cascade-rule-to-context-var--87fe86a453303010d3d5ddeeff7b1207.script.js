if (!pm.isZboot()) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_cs_virtual_agent_context');
    gr.addQuery('element', 'live_agent_setup');
    gr.query();
    if (gr.next()) {
        gr.setValue('reference_cascade_rule', 'delete');
        gr.setValue('read_only', true);
        gr.update();
    }
}
