function clickActivate() {
    var map = g_i18n.getMessages(["Activate Plugin", "Plugin not found"]);
    var dd = new GlideModal("activate_plugin_confirm_ui16");
    dd.setTitle(map["Activate Plugin"]);
    dd.setPreference('sysparm_plugin_id', g_sysId);
    dd.setPreference('sysparm_list_view', true);
    dd.setPreference('sysparm_get_customized_version', true);
    dd.setWidth(500);
    dd.render();
}
