function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateInput(newValue);
}

function validateInput(newValue) {
    var maxMidQuantity = g_scratchpad.mid_deployment_max_mid_quantity;
    var min = parseInt(g_form.getValue('hpa_v1_min_replicas'), 10);
    var max = parseInt(newValue, 10);
    if (isNaN(max) || max < min || max > maxMidQuantity) {
        var msg = formatMessage(getMessage('Please enter a number between {0} (minimum number of replicas) and {1} (mid.deployment.max_mid_quantity)'), min, maxMidQuantity);
        g_form.showFieldMsg("hpa_v1_max_replicas", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("hpa_v1_max_replicas");
        if (min >= 0 && min <= max)
            g_form.hideFieldMsg("hpa_v1_min_replicas");
    }
    return true;
}
