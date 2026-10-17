function deleteUsersFromRole() {
	var numSel = 0;
    var tblName = g_list.getTableName();
    var selSysIds = g_list.getChecked();
    var sysIdList = selSysIds.split(',');
    
	numSel = sysIdList.length;
    
    if(numSel > 0) {
			var deleteType = "deletefromrole";
		var gr = new GlideRecord("sys_user_has_role");
		gr.addQuery("sys_id", "IN", selSysIds);
		gr.addQuery("inherited", "1");
		gr.query();
		if (gr.hasNext())
			deleteType = "deletefromgroup";
        showDeleteUserFromRoleConfDlg(selSysIds, tblName, deleteType);
    }
}

function showDeleteUserFromRoleConfDlg(delObjList, tblName, deleteType) {
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_confirm_remove_user_access_to_table');
	if (deleteType == 'deletefromgroup')
		dlg.setTitle(new GwtMessage().getMessage('Remove from Group'));
	else
		dlg.setTitle(new GwtMessage().getMessage('Remove User from Role'));
    dlg.setPreference('sysparm_obj_list', delObjList);
	dlg.setPreference('sysparm_table_name', tblName);
	dlg.setPreference('sysparm_user_deletion', true);
	dlg.setPreference('sysparm_user_delete_type', deleteType);
	dlg.setPreference('sysparm_remove_user_access_to_table','true');
    dlg.render();
}
