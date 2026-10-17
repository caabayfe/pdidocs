var tblName;
var selSysIds;
var sysIdList;

function confirmAndDeleteFromList() {
    tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
	sysIdList = selSysIds.split(',');

    if (selSysIds.length > 0) {
        showConfirmationDialog("false", "");
    }
}

function showConfirmationDialog(hasCascadeDel, selObjName, delObjList) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_confirm_list');
    var title = typeof GwtMessage !== 'undefined' ? new GwtMessage().getMessage('Confirmation') : 'Confirmation';
    dlg.setTitle(title);
    if (delObjList == null) {
        dlg.setWidth(300);
    } else {
        dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_list', selSysIds);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_has_cascade_del', 'false');
    dlg.setPreference('focusTrap', true);
    dlg.render();
}
