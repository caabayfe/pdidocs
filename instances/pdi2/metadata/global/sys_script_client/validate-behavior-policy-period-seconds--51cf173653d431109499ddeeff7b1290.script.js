function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateInput(newValue);
}

function validateInput(newValue) {
    if (isNaN(newValue) || newValue > 1800 || newValue < 0) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and 1800 (30 min)'));
        g_form.showFieldMsg("period_seconds", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("period_seconds");
    }
    return true;
}
