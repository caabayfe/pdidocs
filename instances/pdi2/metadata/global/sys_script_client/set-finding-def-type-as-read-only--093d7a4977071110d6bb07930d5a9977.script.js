function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.setReadOnly("type", !g_user.hasRole("sn_process_mining_power_user"));
    }
}
