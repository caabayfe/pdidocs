(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('live_group_profile');
    gr.setWorkflow(false);
    gr.addQuery("sys_id", current.group);
    gr.query();
    gr.setWorkflow(true);
    if (gr.next()) {
        var updatedRecord = new GlideRecord(gr.table);
        updatedRecord.addQuery("sys_id", gr.document);
        updatedRecord.query();
        if (updatedRecord.next())
            gs.eventQueue("polaris.follow.update", updatedRecord, null, null);
    }
})(current, previous);
