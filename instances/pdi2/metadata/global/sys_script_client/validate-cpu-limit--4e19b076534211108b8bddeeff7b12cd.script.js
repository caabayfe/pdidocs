function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.hideFieldMsg('cpu_limit', 'error');

    var moreInfoTxt = ', please refer Kubernetes doc for more info';

    if (newValue != '' && !isValidCpuFormat(newValue)) {
        showError('cpu_limit', 'Please enter valid cpu format Eg: 0.5 or 500m' + moreInfoTxt);
        return false;
    }

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

function showError(field, message) {
    var msg = formatMessage(getMessage(message));
    g_form.showFieldMsg(field, msg, "error");
}
