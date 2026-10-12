(function executeRule(current, previous /*null when async*/ ) {
    var errorMessage = null;
    if (current.name == 'mid.inactivity.timeout.enabled') {
        if (JSUtil.nil(current.type) || current.type != 'boolean' || JSUtil.nil(current.value) || ((current.value) != 'true' && (current.value != 'false')))
            errorMessage = gs.getMessage("Property type must be 'true | false'.");
    } else if (current.name == 'mid.inactivity.timeout.days') {
        if (JSUtil.nil(current.type) || current.type != 'integer')
            errorMessage = gs.getMessage("Type must be integer.");
        else if (JSUtil.nil(current.value) || isNaN(current.value) || current.value.indexOf(".") !== -1 || parseInt(current.value, 10) < 0)
            errorMessage = gs.getMessage("Value must be a positive integer representing the number of days of inactivity before timeout occurs (0 disables inactivity timeout).");
    }

    if (errorMessage != null) {
        gs.addErrorMessage(errorMessage);
        current.setAbortAction(true);
    }
})(current, previous);
