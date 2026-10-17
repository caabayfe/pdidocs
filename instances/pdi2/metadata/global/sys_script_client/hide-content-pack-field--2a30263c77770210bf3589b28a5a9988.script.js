function onLoad() {
    g_form.setDisplay('content_pack', false);
    if (g_user.hasRole("maint")) {
        g_form.setDisplay('content_pack', true);
    } else if (!g_form.isNewRecord() && g_form.getValue("content_pack") == "true") {
        g_form.setDisplay('content_pack', true);
    }
}
