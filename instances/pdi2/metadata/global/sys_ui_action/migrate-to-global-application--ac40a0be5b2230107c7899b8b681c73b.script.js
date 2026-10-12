function openMigrateToGlobalAppModal() {
	var keyset = g_list.getChecked();
	
	var gm = new GlideModal("migrate_to_global_application");
	gm.setTitle(new GwtMessage().getMessage('migrate_global_app_title'));
	gm.setPreference('sysparm_update_sets', keyset);
	gm.setPreference('sysparm_table_name', g_list.getTableName());
	gm.setWidth(500);
	gm.render();
}
