function uninstallApp() {  // note: canRead() => Admin...  and current.isValidRecord()
    var sysId = g_form.getUniqueValue();
    var pluginId = g_scratchpad.sysStoreAppSysCode;
	var dd = new GlideModal("sn_appclient_uninstall_app_dialog");
	dd.setTitle(new GwtMessage().getMessage('Uninstall {0}',g_form.getValue("name")));//will be replaced with translation
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setPreference('sysparm_plugin_id', pluginId);
	dd.setPreference('sysparm_shared_internally', g_form.getValue("shared_internally"));
	//dd.setWidth(450);
	dd.render();
}
