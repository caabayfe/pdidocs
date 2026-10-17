function onLoad() {
    g_form.setVisible('device', false);
    g_form.setVisible('user', false);
    g_form.setReadOnly('collection', true);
    g_form.showFieldMsg("condition", "Conditions cannot be added or modified if the user does not have access to the table", "info");

}
