function ok() {
	var ajaxHelper = new GlideAjax('OauthRevokeTokenAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithRevokeFromListContextMenu');
    ajaxHelper.addParam('sysparm_sys_id', '${JS:sysparm_sys_id}');
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
