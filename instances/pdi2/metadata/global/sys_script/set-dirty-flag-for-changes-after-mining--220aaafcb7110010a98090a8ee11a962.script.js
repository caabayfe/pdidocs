(function executeRule(current, previous /*null when async*/ ) {
    if ((current.operation() == "insert" || current.operation() == "delete") && !current.activity_of_interest) {
        setDirty();
    } else if (current.operation() == "update" && (current.field.changes() || current.entity.changes() || current.track_change.changes() || current.activity_of_interest.changes() || current.include_empty_start_node.changes() || current.choose_values.changes() || current.field_values.changes() || current.display_order.changes())) {
        setDirty();
    }

    function setDirty() {
        SNC.ProcessOptimization.setDirty(current.entity.project, true);
    }

})(current, previous);
