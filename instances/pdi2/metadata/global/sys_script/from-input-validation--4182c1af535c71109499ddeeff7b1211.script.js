(function executeRule(current, previous /*null when async*/ ) {

    var type = current.getValue('type');
    var scale_direction = current.getValue('scale_direction');
    var value = parseInt(current.getValue('value'));
    var period_seconds = parseInt(current.getValue('period_seconds'));

    if (type == null || scale_direction == null || isNaN(value) || isNaN(period_seconds)) {
        gs.addErrorMessage(gs.getMessage('Please enter a valid HPAv2 Behavior Policy Record'));
        current.setAbortAction(true);
        return false;
    } else if (period_seconds > 1800 || period_seconds < 0) {
        gs.addErrorMessage(gs.getMessage('All ""periodSeconds"" entries for HPAv2 Behavior Policies must be between 0 and 1800'));
        current.setAbortAction(true);
    } else if (value < 0) {
        gs.addErrorMessage(gs.getMessage('All ""Value"" entries for HPAv2 Behavior Policies must be greater than 0'));
        current.setAbortAction(true);
    }

})(current, previous);
