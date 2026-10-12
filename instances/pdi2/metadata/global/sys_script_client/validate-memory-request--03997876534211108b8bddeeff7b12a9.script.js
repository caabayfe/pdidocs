function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.hideFieldMsg('memory_request', 'error');
    var moreInfoTxt = ', please refer Kubernetes doc for more info';
    
    if (newValue != '' && !isValidMemoryFormat(newValue)) {
        showError('memory_request', 'Please enter valid memory format' + moreInfoTxt);
        return false;
    }

}


function showError(field, message) {
    var msg = formatMessage(getMessage(message));
    g_form.showFieldMsg(field, msg, "error");
}


function isValidMemoryFormat(value) {
    var regex = /^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/;
    return regex.test(value);
}
