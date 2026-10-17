function showConvertAppConfirmDialog() {
	var dd = new GlideModal("sn_appclient_convert_app_confirm");
	dd.setTitle(new GwtMessage().getMessage('Are you sure you want to convert this app?'));
	dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setWidth(500);
	dd.render();
}
