(function executeRule(current, previous) {
    const processDefinition = current.guidance.process_definition;
    const spsGr = new GlideRecordSecure('sys_pd_snapshot');
    spsGr.addQuery('source', processDefinition);
    spsGr.orderByDesc('sys_created_on');
    spsGr.query();
    if (spsGr.next()) {
        current.guidance_snapshot = spsGr.sys_id;
    }
    current.update();
})(current, previous);
