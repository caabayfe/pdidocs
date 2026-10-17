(function executeRule(current, previous /*null when async*/) {

	var msg = "Impacted Services are not supported";
    if (current.getValue('alert_filter').contains("sn_services")) {
        current.error_msg = msg;
    } else if (current.error_msg == msg) {
        //we want to clear Impacted Services error msg
        //only if current.error_msg have the same message and didn't overridden by other error
        current.error_msg = "";
    }

})(current, previous);
