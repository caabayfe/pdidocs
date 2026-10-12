function transform(input) {
    var res = [];

    var displayRecentTasks = gs.getProperty("glide.knowman.recent_tasks.display", "false");
    if (displayRecentTasks == "false")
        return res;
    var recentTasksLimit = gs.getProperty("glide.knowman.recent_tasks", 10);

    // Get GlideRecord reference to KB record
    var kb = new GlideRecordSecure("kb_knowledge");
    kb.get(input.sysId);

    var m2mKbTaskGr = new GlideRecordSecure('m2m_kb_task');
    var versioningInstalled = GlidePluginManager.isActive("com.snc.knowledge_advanced");
    if (versioningInstalled && !kb.summary.nil()) {
        m2mKbTaskGr.addQuery('kb_knowledge.summary', "=", kb.summary);
        m2mKbTaskGr.addQuery('kb_knowledge.sys_created_on', '<=', kb.sys_created_on);
    } else {
        m2mKbTaskGr.addQuery('kb_knowledge', kb.sys_id);
    }
    m2mKbTaskGr.orderByDesc('task.sys_created_on');
    m2mKbTaskGr.setLimit(recentTasksLimit);
    m2mKbTaskGr.query();
    var seenTasks = [];
    while (m2mKbTaskGr.next()) {
        var taskNumber = m2mKbTaskGr.task.number;
        if (seenTasks.indexOf(taskNumber) !== -1) {
            continue;
        }
        seenTasks.push(taskNumber);
        res.push({
            number: m2mKbTaskGr.task.number.getValue(),
            short_description: m2mKbTaskGr.task.short_description.getValue(),
            sys_id: m2mKbTaskGr.task.sys_id.getValue(),
            table: m2mKbTaskGr.task.sys_class_name.getValue()
        });
    }
    return res;
}
