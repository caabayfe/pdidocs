function ok() {
	var ajaxHelper = new GlideAjax('QuarantineActionsProcessor');
	ajaxHelper.addParam('sysparm_name', 'deleteQuarantinedFiles');
	ajaxHelper.addParam('sysparm_obj_list', '${JS:sysparm_obj_list}');
	ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
	ajaxHelper.getXMLAnswer(deleteDone.bind(this));
	return true;
}

function cancel() {
	destroyDialog();
	return false;
}

function deleteDone() {
	destroyDialog();
	g_navigation.reloadWindow();
}

function destroyDialog() {
	GlideDialogWindow.get().destroy();
}
