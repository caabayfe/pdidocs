function ok() {
    var ajaxHelper = new GlideAjax('DocumentObjectManager');
    ajaxHelper.addParam('sysparm_name', 'proceedWithRemoveFromList');
    ajaxHelper.addParam('sysparm_document_sys_id_list', '${JS:sysparm_document_sys_id_list}');
	ajaxHelper.addParam('sysparm_table_sys_id','${JS:sysparm_table_sys_id}');
	ajaxHelper.addParam('sysparm_table_name','${JS:sysparm_table_name}');
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
