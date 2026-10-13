function ok() {
    var ajaxHelper = new GlideAjax('DeleteResponsibilityRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDelete');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_disable_wf', '${JS:sysparm_disable_wf}');
    ajaxHelper.setWantSessionMessages(false);
	if ('${JS:sysparm_this_url}'.includes('_list.do'))
		ajaxHelper.getXML(deleteFromListCompleted.bind('${JS:sysparm_parent_form}'));
	else
		ajaxHelper.getXML(deleteCompleted.bind('${JS:sysparm_parent_form}'));
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

function deleteFromListCompleted() {
	destroyDialog();
	g_navigation.reloadWindow();
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
