(function executeRule(current, previous /*null when async*/ ) {
    if ((current.operation() == "insert" || current.operation() == "delete")) {
        setDirty();
    } else if (current.operation() == "update" && (current.field.changes() || current.entity.changes() || current.has_filter.changes() || current.filter_table.changes() || current.filter.changes())) {
        setDirty();
    }

    function setDirty() {
        SNC.ProcessOptimization.setDirty(current.entity.project, true);
    }

})(current, previous);
