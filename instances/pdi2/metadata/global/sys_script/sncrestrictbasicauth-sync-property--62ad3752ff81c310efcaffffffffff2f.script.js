(function executeRule(current, previous /*null when async*/) {
    var AUDIT_MARKER = 'admin';
    var gr = new GlideRecord('sys_properties');
    gr.addQuery('name', 'glide.authenticate.basic_auth.restriction.enforcement_date');
    gr.query();
    if (gr.next()) {
        gr.setValue('value', current.next_action.getValue());
        gr.setWorkflow(false);
        stamp(gr);
        gr.update();
    }

    function stamp(gr) {
        gr.autoSysFields(false);
        var nowGdt = new GlideDateTime().getValue();
        var modCount = parseInt(gr.getValue('sys_mod_count') || '0', 10);
        gr.setValue('sys_mod_count', modCount + 1);
        gr.setValue('sys_updated_by', AUDIT_MARKER);
        gr.setValue('sys_updated_on', nowGdt);
    }

})(current, previous);
