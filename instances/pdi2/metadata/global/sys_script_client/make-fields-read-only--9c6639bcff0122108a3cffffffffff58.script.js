function onLoad() {
    if (!g_form.isNewRecord()) {
        g_form.addInfoMessage(new GwtMessage().getMessage('The fields App Profile and Target Scope cannot be updated. Please delete it and recreate if needs update'));
        g_form.setReadOnly('app_profile', true);
        g_form.setReadOnly('target_scope', true);
    }
}
