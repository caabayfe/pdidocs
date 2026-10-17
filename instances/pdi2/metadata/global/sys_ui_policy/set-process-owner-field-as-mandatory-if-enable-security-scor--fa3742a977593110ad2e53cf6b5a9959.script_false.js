function onCondition() {
    if (g_form.getValue("public_access") == "false")
        g_form.setDisplay("process_owner", false);
}
