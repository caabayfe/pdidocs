function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateInput(newValue);
}

function validateInput(newValue) {
    var scaleDownStabilizationWSecs = g_form.getIntValue('hpa_v2_scale_down_stabilization_window_seconds');
    if (isNaN(scaleDownStabilizationWSecs) || scaleDownStabilizationWSecs > 3600 || scaleDownStabilizationWSecs < 0) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and 3600 (1 hour)'));
        g_form.showFieldMsg("hpa_v2_scale_down_stabilization_window_seconds", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("hpa_v2_scale_down_stabilization_window_seconds");
    }
    return true;
}
