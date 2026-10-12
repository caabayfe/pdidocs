function onSubmit() {
    var terminationGraceTime = g_form.getValue('termination_grace_time');
    var ssChoice = g_form.getBooleanValue('ss_choice');
    return validateMidQuantity(ssChoice) &&
        validateResourceLimits() &&
        validateTerminationGraceTime(terminationGraceTime) &&
        validateStatefulSetName(ssChoice) &&
        validateHPAConfiguration(ssChoice) &&
        validateHPAv2Configuration(ssChoice);
}

function validateResourceLimits() {
    var cpuRequest = g_form.getValue('cpu_request').trim();
    var cpuLimit = g_form.getValue('cpu_limit').trim();
    var memoryRequest = g_form.getValue('memory_request').trim();
    var memoryLimit = g_form.getValue('memory_limit').trim();
    if (cpuRequest != '' && !isValidCpuFormat(cpuRequest)) {
        return false;
    }
    if (cpuLimit != '' && !isValidCpuFormat(cpuLimit)) {
        return false;
    }
    if (memoryRequest != '' && !isValidMemoryFormat(memoryRequest)) {
        return false;
    }
    if (memoryLimit != '' && !isValidMemoryFormat(memoryLimit)) {
        return false;
    }
    return true;
}

function showError(field, message) {
    var msg = formatMessage(getMessage(message));
    g_form.showFieldMsg(field, msg, "error");
}

function isValidMemoryFormat(value) {
    var regex = /^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/;
    return regex.test(value);
}

function isValidCpuFormat(value) {
    return (isValidCpuUnit(value) || isValidCpuUnitM(value));
}

function isValidCpuUnit(value) {
    if (isNaN(value) || parseFloat(value) <= 0) {
        return false;
    }
    var regex = /^(\d*)((\.)((\d{1})|(\d{2})|(\d{3})|))?$/;
    return regex.test(value);
}

function isValidCpuUnitM(value) {
    var regex = /^(\d+)[m]$/;
    if (regex.test(value)) {
        return parseInt(value.slice(0, value.length - 1)) > 0;
    }
    return false;
}

function validateMidQuantity(ssChoice) {
    var maxMidQuantity = g_scratchpad.mid_deployment_max_mid_quantity;
    var midQuantity = ssChoice ? g_form.getValue('replicas') : g_form.getValue('mid_quantity');
    var parsed = parseInt(midQuantity, 10);
    if (isNaN(parsed) || (parsed <= 0 || parsed > maxMidQuantity)) {
        var msg = formatMessage(getMessage('Please enter a number between 1 and {0}'), maxMidQuantity);
        g_form.showFieldMsg(ssChoice ? "replicas" : "mid_quantity", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg(ssChoice ? "replicas" : "mid_quantity");
    }
    return true;
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

function validateStatefulSetName(ssChoice) {
    if (!ssChoice) {
        return true;
    }

    var ssName = g_form.getValue('ss_name');
    var regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (!regex.test(ssName)) {
        var msg = getMessage('Invalid StatefulSet name!');
        g_form.showFieldMsg("ss_name", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("ss_name");
    }
    return true;
}

function validateHPAConfiguration(ssChoice) {
    var hpaChoice = g_form.getValue('hpa_choice');
    if (!ssChoice || (hpaChoice != 'hpa_v1'))
        return true;

    var maxMidQuantity = g_scratchpad.mid_deployment_max_mid_quantity;
    var min = parseInt(g_form.getValue('hpa_v1_min_replicas'), 10);
    var max = parseInt(g_form.getValue('hpa_v1_max_replicas'), 10);

    var result = true;
    if (isNaN(min) || min < 0 || min > max) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and {0} (maximum number of replicas)'), max);
        g_form.showFieldMsg("hpa_v1_min_replicas", msg, "error");
        result = false;
    } else {
        g_form.hideFieldMsg("hpa_v1_min_replicas");
    }

    if (isNaN(max) || max < min || max > maxMidQuantity) {
        var msg = formatMessage(getMessage('Please enter a number between {0} (minimum number of replicas) and {1} (mid.deployment.max_mid_quantity)'), min, maxMidQuantity);
        g_form.showFieldMsg("hpa_v1_max_replicas", msg, "error");
        result = false;
    } else {
        g_form.hideFieldMsg("hpa_v1_max_replicas");
    }
    return result;
}

function validateHPAv2Configuration(ssChoice) {
    var hpaChoice = g_form.getValue('hpa_choice');

    if (!ssChoice || (hpaChoice != 'hpa_v2'))
        return true;

    var scaleUpStabilizationWSecs = g_form.getIntValue('hpa_v2_scale_up_stabilization_window_seconds');
    var scaleDownStabilizationWSecs = g_form.getIntValue('hpa_v2_scale_down_stabilization_window_seconds');

    var result = true;
    if (isNaN(scaleDownStabilizationWSecs) || scaleDownStabilizationWSecs > 3600 || scaleDownStabilizationWSecs < 0) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and 3600 (1 hour)'));
        g_form.showFieldMsg("hpa_v2_scale_down_stabilization_window_seconds", msg, "error");
        result = false;
    } else {
        g_form.hideFieldMsg("hpa_v2_scale_down_stabilization_window_seconds");
    }

    if (isNaN(scaleUpStabilizationWSecs) || scaleUpStabilizationWSecs > 3600 || scaleUpStabilizationWSecs < 0) {
        var msg = formatMessage(getMessage('Please enter a number between 0 and 3600 (1 hour)'));
        g_form.showFieldMsg("hpa_v2_scale_up_stabilization_window_seconds", msg, "error");
        result = false;
    } else {
        g_form.hideFieldMsg("hpa_v2_scale_up_stabilization_window_seconds");
    }

    return result;
}
