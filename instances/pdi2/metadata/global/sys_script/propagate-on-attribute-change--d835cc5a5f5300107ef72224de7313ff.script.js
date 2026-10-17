var vncc = JSUtil.toBoolean(gs.getProperty('com.snc.cluster.vncc.enabled', false));

if (vncc) {
    var s = new SchedulerVNCC();
    var cs = new GlideRecord("sys_cluster_state");
    cs.addQuery("node_type", current.sys_id);
    cs.query();

    while (cs.next())
        s.propagateRATriggersForNode(cs);

}
