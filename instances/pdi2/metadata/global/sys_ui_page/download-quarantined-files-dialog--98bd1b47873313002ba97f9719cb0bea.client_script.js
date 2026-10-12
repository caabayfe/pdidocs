function ok() {
	var sysIds = '${JS:sysparm_obj_list}';
	var tblName = '${JS:sysparm_table_name}';
	var ajaxHelper = new GlideAjax('QuarantineActionsProcessor');
	ajaxHelper.addParam('sysparm_name', 'getAttachmentIds');
	ajaxHelper.addParam('sysparm_obj_list', sysIds);
	ajaxHelper.addParam('sysparm_table_name', tblName);
	ajaxHelper.getXMLAnswer(downloadAttachments.bind(this), null, null);
	return true;
}

function downloadAttachments(attachmentIds){
	var url = new GlideURL('/download_quarantined_attachments.do?sys_ids=' + attachmentIds);
	var w = getTopWindow();
	var newWindow = w.open(url.getURL());
	newWindow.focus();
	downloadDone();
}

function cancel() {
	destroyDialog();
	return false;
}

function downloadDone() {
	destroyDialog();
	g_navigation.reloadWindow();
}

function destroyDialog() {
	GlideDialogWindow.get().destroy();
}
