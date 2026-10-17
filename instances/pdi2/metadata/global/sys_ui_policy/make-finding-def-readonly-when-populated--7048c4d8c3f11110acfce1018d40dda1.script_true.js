function onCondition() {
    if (!g_form.isNewRecord()) {
        g_form.setReadOnly('finding_def', 'true');
    }
}
