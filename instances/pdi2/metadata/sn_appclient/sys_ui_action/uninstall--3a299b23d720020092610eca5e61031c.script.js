function uninstallApp() {
    var scopeSysId = g_scratchpad.sys_scope;
    var pluginId = g_form.getValue("id");
	var dd = new GlideModal("sn_appclient_uninstall_app_dialog");
	dd.setTitle(new GwtMessage().getMessage('Uninstall {0}',g_form.getValue("name")));
	dd.setPreference('sysparm_sys_id', scopeSysId);
	dd.setPreference('sysparm_plugin_id', pluginId);
	dd.setPreference('sysparm_shared_internally', g_form.getValue("shared_internally"));
	dd.setPreference('sysparm_redirect', "0");
	dd.setWidth(450);
	dd.render();
}
