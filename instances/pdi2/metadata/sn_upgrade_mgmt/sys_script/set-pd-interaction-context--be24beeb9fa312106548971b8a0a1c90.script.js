(function executeRule(current, previous) {
    const gr = new GlideRecordSecure('sys_pd_context');
    gr.addQuery('input_record', current.getUniqueValue());
    gr.orderByDesc('sys_created_on');
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        current.sys_pd_context_id = gr.getUniqueValue();
    }
    current.update();
})(current, previous);
