function ok() {
    var ajaxHelper = new GlideAjax('DocumentVersionManager');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromList');
    ajaxHelper.addParam('sysparm_document_version_sys_id_list', '${JS:sysparm_document_version_sys_id_list}');
    ajaxHelper.getXMLAnswer(deleteDone.bind(this));
    return true;
}

function ok_form() {
    var ajaxHelper = new GlideAjax('DocumentVersionManager');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromForm');
    ajaxHelper.addParam('sysparm_document_version_sys_id', '${JS:sysparm_document_version_sys_id}');
	ajaxHelper.getXMLAnswer(function(){
		GlideDialogWindow.get().destroy();
		var DocumentVersionModal = GlideModal.prototype.get('ds_document_version');
		if (DocumentVersionModal.getID()){
			DocumentVersionModal.destroy();
		} else {
			var url = new GlideURL('ds_document_version_list.do');
			window.location.href = url.getURL();
		}
	});
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
