function uninstallApp() {  // note: canRead() => Admin...  and current.isValidRecord()
    var sysId = g_form.getUniqueValue();
  var pluginId = g_scratchpad.sysStoreAppSysCode;
	var dd = new GlideModal("sn_appclient_uninstall_app_dialog");
	dd.setTitle(new GwtMessage().getMessage('Remove tables and data'));
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setPreference('sysparm_plugin_id', pluginId);
	dd.setWidth(450);
	dd.render();
}   
