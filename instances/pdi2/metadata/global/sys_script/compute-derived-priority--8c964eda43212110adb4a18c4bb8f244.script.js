(function executeRule(current, previous) {
    if (current.priority <= 0) {
        current.setAbortAction(true);
        gs.addErrorMessage(sn_i18n.Message.getMessage('ui_invalid_priority_msg', 'Priority is invalid; priority can only be a positive number.'));
        return;
    }
    // For now, it will set 'derived_priority' = 'priority'
    // Eventually 'derived_priority' will be computed based on the metrics data.
    var max = 2147483647;
    if (current.priority >= max)
        current.derived_priority = max;
    else
        current.derived_priority = current.priority;
})(current, previous);
