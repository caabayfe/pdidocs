function onLoad() {
    if (g_scratchpad.isConfigExists) {
        g_form.setValue('advanced', false);
        g_form.setReadOnly('advanced', true);
    } else {
        g_form.setReadOnly('advanced', false);
    }
}
