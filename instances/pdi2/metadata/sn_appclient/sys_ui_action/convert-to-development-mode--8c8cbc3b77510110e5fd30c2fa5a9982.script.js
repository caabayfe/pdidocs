function showConvertStoreAppConfirmDialog() {
	var dd = new GlideModal("sn_appclient_convert_store_app_confirm");
	dd.setTitle(new GwtMessage().getMessage('Convert Installed Application to Development Mode'));
	dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setWidth(500);
	dd.render();
}
