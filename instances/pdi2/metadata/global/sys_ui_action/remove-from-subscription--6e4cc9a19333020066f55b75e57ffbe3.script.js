function removeUserFromSubscription() {
	var numSel = 0;
    var tblName = g_list.getTableName();
    var selSysIds = g_list.getChecked();
    var sysIdList = selSysIds.split(',');

	numSel = sysIdList.length;

    if(numSel > 0) {
        showRemoveUserConfDlg(selSysIds, tblName);
    }
}

function showRemoveUserConfDlg(delObjList, tblName) {
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_confirm_delete_users_from_subscription');
    dlg.setTitle(new GwtMessage().getMessage('Remove User from Subscription'));
    dlg.setWidth(500);
    dlg.setPreference('sysparm_obj_list', delObjList);
	dlg.setPreference('sysparm_table_name', tblName);
	dlg.setPreference('sysparm_user_deletion', true);
	dlg.setPreference('sysparm_user_delete_type','remove');
    dlg.render();
}
