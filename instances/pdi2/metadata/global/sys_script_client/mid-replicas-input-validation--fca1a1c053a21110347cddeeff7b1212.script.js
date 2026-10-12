function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateReplicas(newValue);
}

function validateReplicas(newValue) {
    var maxMidQuantity = g_scratchpad.mid_deployment_max_mid_quantity;
    var parsed = parseInt(newValue, 10);
    if (isNaN(parsed) || (parsed <= 0 || parsed > maxMidQuantity)) {
        var msg = formatMessage(getMessage('Please enter a number between 1 and {0}'), maxMidQuantity);
        g_form.showFieldMsg("replicas", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("replicas");
    }
    return true;
}
