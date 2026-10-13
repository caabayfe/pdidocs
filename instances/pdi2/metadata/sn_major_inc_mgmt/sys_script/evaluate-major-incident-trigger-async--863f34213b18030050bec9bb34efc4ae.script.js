(function executeRule(current, previous /*null when async*/ ) {
    var userId = gs.getUserID();
    gs.eventQueue('sn_major_inc_mgmt.evaluate_trigger_rules', current, userId);
})(current, previous);
