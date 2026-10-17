(function executeRule(current, previous /*null when async*/ ) {
    current.origin_instance_id = gs.getProperty("instance_id");
    current.origin_instance_name = gs.getProperty("instance_name");
})(current, previous);
