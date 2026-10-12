(function executeRule(current, previous /*null when async*/ ) {
    // callable test steps have no step config with description generator
    if (current.getRecordClassName() == 'sys_atf_step_callable') {
        if (!gs.nil(current.callable_test.description)) {
            current.description = current.callable_test.description;
        }
    } else {
        var utProcessor = new sn_atf.UserTestProcessor();
        var desc = utProcessor.getDescription(current);
        if (desc != "") {
            current.description = desc;
        }
    }
})(current, previous);
