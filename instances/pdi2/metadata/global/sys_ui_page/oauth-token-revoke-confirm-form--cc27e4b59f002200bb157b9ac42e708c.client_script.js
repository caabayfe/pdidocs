function ok() {
	var ajaxHelper = new GlideAjax('OauthRevokeTokenAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithRevokeFromForm');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
	ajaxHelper.addParam('sysparm_disable_wf', '${JS:sysparm_disable_wf}');
	ajaxHelper.setWantSessionMessages(false);
    ajaxHelper.getXMLAnswer(deleteCompleted.bind('${JS:sysparm_parent_form}'));
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

function deleteCompleted() {
	destroyDialog();

	g_navigation.reloadWindow();
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
