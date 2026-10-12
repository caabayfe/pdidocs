(function() {
    if (pm.isZboot())
        return;

    function getKnownSystemIds() {
        var knownSystemIds = [];
        var state = new GlideAggregate("sys_cluster_state");
        state.setWorkflow(false);
        state.groupBy("system_id");
        state.query();
        while (state.next()) {
            knownSystemIds.push(state.getValue("system_id"));
        }
        return knownSystemIds;
    }

    var knownSystemIds = getKnownSystemIds();
    var ga = new GlideAggregate("sys_trigger");
    ga.setWorkflow(false);
    ga.addNotNullQuery("parent");
    ga.addNotNullQuery("system_id");
    ga.addQuery("system_id", "!=", "ALL NODES");
    ga.addQuery("system_id", "!=", "ACTIVE NODES");
    ga.addQuery("system_id", "NOT IN", GlideStringUtil.join(knownSystemIds));
    ga.groupBy("system_id");
    ga.query();
    while (ga.next()) {
        var node = new GlideRecord("sys_cluster_state");
        node.setValue("system_id", ga.getValue("system_id"));
        node.setValue("sys_id", "deleted");
        gs.print("Run SchedulerVNCC for deleted node: " + ga.getValue("system_id"));
        new SchedulerVNCC().propagateRATriggersForNode(node);
    }
})();
