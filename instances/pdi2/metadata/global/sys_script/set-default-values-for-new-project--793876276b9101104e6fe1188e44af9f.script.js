(function executeRule(current, previous /*null when async*/ ) {
    current.last_mined_time = "";
    current.error_message = "";
    current.dirty = false;
    current.state = "NEW";
    if (current.is_template) {
        current.status = "PUBLISHED";
    }
})(current, previous);
