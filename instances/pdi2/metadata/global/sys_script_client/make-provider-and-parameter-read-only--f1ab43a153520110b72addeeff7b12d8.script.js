function onLoad() {
    if (g_form.isNewRecord())
        return;

    g_form.setReadOnly("parameter", true);
    g_form.setReadOnly("provider", true);
}
