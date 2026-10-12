(function executeRule(current, previous /*null when async*/ ) {
    if (current.up_update_status != 'acknowledged') {
        current.up_completed_user = "";
        current.update();
    }

})(current, previous);
