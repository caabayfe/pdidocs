function onCondition() {
    if (g_form.isNewRecord()) {
        g_form.setReadOnly('public_access', false);
        return;
    }

    if (g_form.getValue('public_access') == 'false') {
        g_form.setReadOnly('public_access', true);
    }
}
