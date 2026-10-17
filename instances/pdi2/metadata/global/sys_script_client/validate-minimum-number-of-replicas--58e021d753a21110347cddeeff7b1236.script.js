function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateInput(newValue);
}

function validateInput(newValue) {
	var maxMidQuantity = g_scratchpad.mid_deployment_max_mid_quantity;
    var max = parseInt(g_form.getValue('hpa_v1_max_replicas'), 10);
    var min = parseInt(newValue, 10);
    if (isNaN(min) || min < 0 || min > max) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and {0} (maximum number of replicas)'), max);
        g_form.showFieldMsg("hpa_v1_min_replicas", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("hpa_v1_min_replicas");
		if (max >= min && max <= maxMidQuantity)
			g_form.hideFieldMsg("hpa_v1_max_replicas");
    }
    return true;
}
