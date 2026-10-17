function onLoad() {
    if (!g_scratchpad.discAzureCBAEnabled) {
        g_form.removeOption('auth_method', 'Client Assertion with MID');
    }
}
