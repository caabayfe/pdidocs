function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    validateTerminationGraceTime(newValue);
}

function validateTerminationGraceTime(newValue) {
    var parsed = parseInt(newValue, 10);
    if (isNaN(parsed) || parsed <= 0) {
        var msg = getMessage('Termination grace time must be a positive number');
        g_form.showFieldMsg("termination_grace_time", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("termination_grace_time");
    }
    return true;
}
