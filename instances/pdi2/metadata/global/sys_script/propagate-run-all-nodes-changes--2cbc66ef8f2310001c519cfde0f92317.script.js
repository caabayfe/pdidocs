(function executeRule(current, previous /*null when async*/ ) {
    if (isParent(current) || isParent(previous)) {
        var s = new SchedulerScriptFactory().getSchedulerScript();
        s.propagateRANodesForTrigger(current);
    }

    // Delete Run Once parent job
    if (current.getValue("trigger_type") === "0" && isParent(current) && (current.operation() === "insert" || current.operation() === "update")) {
        if (current.deleteRecord())
            gs.print("Deleted parent Run Once job name=" + current.getValue("name") + "; sys_id=" + current.getUniqueValue());
    }

    function isParent(trigger) {
        return trigger != null &&
            (trigger.system_id == "ALL NODES" ||
            trigger.system_id == "ACTIVE NODES" ||
            trigger.system_id == "PRIMARY NODES");
    }
})(current, previous);
