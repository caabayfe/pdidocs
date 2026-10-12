function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateInput(newValue);
}

function validateInput(newValue) {
    if (isNaN(newValue) || newValue < 0) {
        var msg = formatMessage(getMessage('Please enter a number greater than 0'));
        g_form.showFieldMsg("value", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("value");
    }
    return true;
}
