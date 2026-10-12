function addFileToAppFromList() {
	selSysIds = gel('dbc95612d701210050f5edcb9e61032f').getAttribute('gsft_allow');
	if (selSysIds === null || selSysIds === '') {
		selSysIds = g_list.getChecked();
		if (selSysIds === null || selSysIds === '')
			return;
	}
	var tableName = g_list.getTableName();
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("add_to_app_dialog");
	dd.setTitle(new GwtMessage().getMessage('Move to application'));
	dd.setPreference('sysparm_sys_source_id_list', selSysIds);
	dd.setPreference('sysparm_sys_table_name', tableName);
	dd.setWidth(400);
	dd.render();
}
