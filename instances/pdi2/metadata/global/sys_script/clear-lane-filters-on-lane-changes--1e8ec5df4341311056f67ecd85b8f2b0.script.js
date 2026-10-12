(function executeRule(current, previous) {
    if (current.swim_lane_field.changes()) {
        current.swim_lane_filter = '';
        current.swim_lane_filter_table = '';
    }
    if (current.field.changes()) {
        current.lane_filter = '';
        current.lane_filter_table = '';
    }
})(current, previous);
