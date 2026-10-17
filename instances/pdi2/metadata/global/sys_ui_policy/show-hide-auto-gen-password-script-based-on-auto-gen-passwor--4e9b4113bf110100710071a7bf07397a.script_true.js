function onCondition() {
	g_form.setValue("password_needs_reset", false);
    g_form.setValue("display_password", false);
    g_form.setValue("send_email", false);
    g_form.setDisplay("password_needs_reset", false);
    g_form.setDisplay("display_password", false);
    g_form.setDisplay("send_email", false);
}
