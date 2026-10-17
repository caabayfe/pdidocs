function confirmAndRestore() {
	var tblName = g_list.getTableName();
	var selSysIds = g_list.getChecked();
	var sysIdList = selSysIds.split(',');
	var numSel = sysIdList.length;
	
	if (numSel > 0) {
		var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
		var dlg = new dialogClass('restore_quarantined_files_dialog');

		dlg.setTitle('Confirmation');
		dlg.setWidth(300);
		dlg.setPreference('sysparm_obj_list', selSysIds);
		dlg.setPreference('sysparm_table_name', tblName);
		dlg.render();
	}
}
