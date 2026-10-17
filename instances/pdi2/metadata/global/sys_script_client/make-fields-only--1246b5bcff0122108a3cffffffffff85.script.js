function onLoad() {
    if (!g_form.isNewRecord()) {
        g_form.addInfoMessage(new GwtMessage().getMessage('Please delete and recreate this record if it needs an update'));
        g_form.setReadOnly('table', true);
        g_form.setReadOnly('column', true);
        g_form.setReadOnly('template', true);
        g_form.setReadOnly('classification', true);
    }
}
