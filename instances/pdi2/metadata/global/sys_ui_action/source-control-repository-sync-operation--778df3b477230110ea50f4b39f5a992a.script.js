function showSyncSourceControlDialog() {
	var dd = new GlideModal("sn_vcs_sync_repo");
	dd.setTitle(new GwtMessage().getMessage('Source Control repository sync operation'));
	dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_app_id', g_form.getValue('sys_app'));
	dd.setWidth(500);
	dd.render();
}
