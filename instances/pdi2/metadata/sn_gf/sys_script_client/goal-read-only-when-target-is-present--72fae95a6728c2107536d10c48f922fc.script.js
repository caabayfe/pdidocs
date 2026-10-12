function onLoad() {
    if (g_form.getValue('target')) {
        g_form.setMandatory('goal', false);
        g_form.setReadOnly('goal', true);
    }
}
