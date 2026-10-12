function ok() {
	
	var request = new GlideAjax('MultiProviderDocumentsManager');
    request.addParam('sysparm_name', 'updateDocument');
    request.addParam('sysparm_actionName', '${JS:sysparm_actionName}');
    request.addParam('sysparm_documentSysId', '${JS:sysparm_documentSysId}');
    request.addParam('sysparm_inputs_separated_by_semi_colon', '${JS:sysparm_inputs_separated_by_semi_colon}');
    request.getXMLAnswer(deleteDone.bind(this));
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
