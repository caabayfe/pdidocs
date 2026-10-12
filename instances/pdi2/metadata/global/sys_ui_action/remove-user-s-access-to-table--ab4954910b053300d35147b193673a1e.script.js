function deleteRoles() {
    var selSysIds = g_list.getChecked();
	var ajaxHelper = new GlideAjax('GlideUserSubscriptionAjax');
	ajaxHelper.addParam('sysparm_name', 'getUserRoles');
    ajaxHelper.addParam('sysparm_ua_user_role_ct_sys_ids', selSysIds);
	var callback = function(userRoles) {
		var userRolesObj = JSON.parse(userRoles);
		var deleteType = "deletefromrole";
		if (userRolesObj.rolesInherited != '') {
			deleteType = "deletefromusergroup";
		}
		
		showDeleteUserFromRoleConfDlg(userRolesObj.rolesNotInherited, 'sys_user_has_role', deleteType);
	};
	
	ajaxHelper.getXMLAnswer(callback.bind(this));
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
