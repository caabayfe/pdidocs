function onLoad() {
    var local_or_existing = g_form.getValue('local_or_existing');
    var security_attribute = g_form.getValue('security_attribute');

    if (local_or_existing == '' && security_attribute != '') {
        g_form.addWarningMessage(getMessage('The security attribute is configured without the local/existing configuration. Please select the appropriate option.'));
    }
}
