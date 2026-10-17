(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue('alert_filter').indexOf('.') != -1) {
        current.error_msg = "Dot-walk in alert filter";
    } else if (previous != null && previous.getValue('alert_filter').indexOf('.') != -1) {
        current.error_msg = "";
    }
})(current, previous);
