(function() {
    if (pm.isZboot())
        return;

    var ga = new GlideAggregate("sys_trigger");
    ga.setWorkflow(false);
    ga.addNotNullQuery("parent");
    ga.addNotNullQuery("system_id");
    ga.addQuery("system_id", "!=", "ALL NODES");
    ga.addQuery("system_id", "!=", "ACTIVE NODES");
    ga.addAggregate("COUNT", "system_id");
    ga.groupBy("system_id");
    ga.groupBy("parent");
    ga.query();

    var nodeSystemIds = {};
    while (ga.next()) {
        if (parseInt(ga.getAggregate("COUNT", "system_id")) > 1) {
            nodeSystemIds[ga.getValue("system_id")] = true;
        }
    }

    for (var systemId in nodeSystemIds) {
        var node = new GlideRecord("sys_cluster_state");
        node.addQuery("system_id", systemId);
        node.addQuery("status", "online");
        node.query();
        if (node.next()) {
            gs.print("Re-running SchedulerVNCC for node: " + systemId + " since duplicate system_id jobs found pinned to this node");
            new SchedulerVNCC().propagateRATriggersForNode(node);
        }
    }
})();
