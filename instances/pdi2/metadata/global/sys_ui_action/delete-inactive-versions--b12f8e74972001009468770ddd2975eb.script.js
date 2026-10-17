var dlg;
var tblName;
var sys_id;

function confirmAndDeleteInactiveVersionsFromForm() {   
	
    dlg = new GlideDialogWindow('delete_confirm_inactive_versions');
    dlg.setTitle(getMessage('Confirmation'));
  
    dlg.setPreference('sysparm_parent_form', this);
	tblName = g_form.getTableName();
	dlg.setPreference('sysparm_table_name', tblName);
	sys_id = g_form.getUniqueValue();
	dlg.setPreference('sysparm_obj_id', sys_id);
    dlg.render();
}

function deleteInactiveVersionsCompleted() {

    dlg.destroy();
	window.location.href = window.location.protocol + '//' + window.location.host + '/' + tblName + '_list.do';
}
