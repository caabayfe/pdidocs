function onCondition() {
    if (!g_form.isNewRecord()) {
        g_form.setReadOnly('frequency', true);
        g_form.setReadOnly('run_as_tz', true);
        g_form.setReadOnly('table', true);
    }
}
