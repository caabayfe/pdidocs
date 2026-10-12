function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.setValue('ignore_cache', true);
    }
}
