function onCondition() {
    if (!g_form.isNewRecord()) {
        g_form.setReadOnly("application_id", true);
        g_form.setReadOnly("service_id", true);
        g_form.setReadOnly("namespace", true);
        g_form.setReadOnly("name", true);
    }
}
