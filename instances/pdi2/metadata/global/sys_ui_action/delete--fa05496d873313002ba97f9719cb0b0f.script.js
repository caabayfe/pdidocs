var tblName;
var selSysIds;
var sysIdList;
var numSel;

function confirmAndDelete() {
	tblName = g_list.getTableName();
	selSysIds = g_list.getChecked();
	sysIdList = selSysIds.split(',');
	numSel = sysIdList.length;
	
	var ajaxHelper = new GlideAjax('QuarantineActionsProcessor');
	ajaxHelper.addParam('sysparm_name', 'countDeletableFiles');
	ajaxHelper.addParam('sysparm_obj_list', selSysIds);
	ajaxHelper.addParam('sysparm_table_name', tblName);
	ajaxHelper.getXMLAnswer(deleterecords.bind(this));
}

function deleterecords(count,s) {
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var dlg = new dialogClass('delete_quarantined_files_dialog');
	var delCount = parseInt(count);
	dlg.setTitle('Confirmation');
	dlg.setWidth(300);
	dlg.setPreference('sysparm_obj_list', selSysIds);
	dlg.setPreference('sysparm_table_name', tblName);
	dlg.setPreference('sysparm_count', delCount);
	dlg.setPreference('sysparm_sel_count', numSel);
	
	if (numSel == 1 && count == 0)
		dlg.setPreference('sysparm_delete', 'cant_delete_single');
	else if (numSel == 1 && count == 1)
		dlg.setPreference('sysparm_delete', 'delete_single');
	else if (count == 0)
		dlg.setPreference('sysparm_delete', 'cant_delete_multiple');
	else if (count < numSel)
		dlg.setPreference('sysparm_delete', 'delete_permitted');
	else if (count == numSel)
		dlg.setPreference('sysparm_delete', 'delete_all_multiple');
	
	dlg.render();
}
