function addFileToAppFromList() {
	var selSysIds = g_list.getChecked();
	var tableName = g_list.getTableName();
	g_i18n.getMessage('Move to application', function(msg) {
		var dd = new GlideModal("add_to_app_dialog_lv3");
		dd.setTitle(msg);
		dd.setPreference('sysparm_sys_source_id_list', selSysIds);
		dd.setPreference('sysparm_sys_table_name', tableName);
		dd.setWidth(400);
		dd.render();
	});
}
