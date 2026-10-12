function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateInput(newValue);
}

function validateInput(newValue) {
    var scaleUpStabilizationWSecs = g_form.getIntValue('hpa_scale_up_stabilization_window_seconds');
    if (isNaN(scaleUpStabilizationWSecs) || scaleUpStabilizationWSecs > 3600 || scaleUpStabilizationWSecs < 0) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and 3600 (1 hour)'));
        g_form.showFieldMsg("hpa_v2_scale_up_stabilization_window_seconds", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("hpa_v2_scale_up_stabilization_window_seconds");
    }
    return true;
}
