function onLoad() {
    if (!g_form.isNewRecord()) {
        g_form.setReadOnly('api_only', true);
    }
}
