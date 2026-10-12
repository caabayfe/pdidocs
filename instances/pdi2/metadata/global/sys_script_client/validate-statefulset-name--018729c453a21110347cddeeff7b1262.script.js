function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    validateStatefulSetName(newValue);
}

function validateStatefulSetName(value) {
    var regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (!regex.test(value)) {
        var msg = getMessage('Invalid StatefulSet name!');
        g_form.showFieldMsg("ss_name", msg, "error");
        return false;
    } else {
        g_form.hideFieldMsg("ss_name");
    }
    return true;
}
