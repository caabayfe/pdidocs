function ok() {
	var request = new GlideAjax('MultiProviderDocumentsManager');
    request.addParam('sysparm_name', 'updateDocumentVersion');
    request.addParam('sysparm_actionName', '${JS:sysparm_actionName}');
	request.addParam('sysparm_document_version_sys_id', '${JS:sysparm_document_version_sys_id}');
    request.addParam('sysparm_inputs_separated_by_semi_colon', '${JS:sysparm_inputs_separated_by_semi_colon}');
    request.getXMLAnswer(deleteDone);
	return true;
}

function cancel() {
	destroyDialog();
	return false;
}

function deleteDone(response) {
	try {        
        var resultJson = JSON.parse(response);
        if (resultJson && resultJson.error_message) {
			var errorMessage = resultJson.error_message;
			// hide delete dialog
            var x = document.getElementById('delete-dialog');
            x.style.display = 'none';			
			// show alert
            var y = document.getElementById('delete-alert');
			y.style.display='block';
			var z = document.getElementById('delete-alert-message');
			z.innerHTML = errorMessage;
        } else {
			destroyDialog();
		}
    } catch (err) {
        jslog('delete_mp_document_version_dialog error occurred: ' + err.message);
        destroyDialog();
    }
}

function destroyDialog() {
	GlideDialogWindow.get().destroy();
}
