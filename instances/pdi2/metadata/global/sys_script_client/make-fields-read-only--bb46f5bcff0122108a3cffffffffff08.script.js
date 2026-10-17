function onLoad() {
    if (!g_form.isNewRecord()) {
        g_form.addInfoMessage(new GwtMessage().getMessage('The parent cannot be updated. Please delete it and recreate if needs update'));
        g_form.setReadOnly('parent', true);
    }
}
