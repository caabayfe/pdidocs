(function executeRule(current, previous /*null when async*/ ) {
    if (current.order != 100)
        return;

    var gr = new GlideRecord('sys_response_header');
    gr.addQuery('sys_scope', current.sys_scope);
    gr.addQuery('record_type', current.record_type);
    gr.addQuery('record_id', current.record_id);
    gr.orderByDesc('order');
    gr.setLimit(1);
    gr.query();
    if (gr.next())
        current.order = gr.order + 100;

})(current, previous);
