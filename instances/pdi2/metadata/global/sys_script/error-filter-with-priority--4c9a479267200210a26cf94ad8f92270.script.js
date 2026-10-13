(function executeRule(current, previous /*null when async*/ ) {

    var msg = "Priority is not supported";
    if (current.getValue('alert_filter').contains("priority")) {
        current.error_msg = msg;
    } else if (current.error_msg == msg) {
        //we want to clear priority error msg
        //only if current.error_msg have the same message and didn't overridden by other error
        current.error_msg = "";
    }

})(current, previous);
