function getCollaborators() {
	var providerDetailId = g_sysId;
	var actionName = "Get Collaborators";
	var subFlowInputs = "provider_detail_sys_id=" + providerDetailId;
	
	var request = new GlideAjax('MultiProviderDocumentsManager');
	request.addParam('sysparm_name', 'getCollaborators');
	request.addParam('sysparm_actionName', actionName);
	request.addParam('sysparm_providerDetailId', providerDetailId);
	request.addParam('sysparm_inputs_separated_by_semi_colon', subFlowInputs);
	request.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	//Ignoring response for now
    var answer = serverResponse.responseXML.documentElement.getAttribute("answer");
	var resultJson = JSON.parse(answer);    
    if (resultJson && resultJson.error_message) {
        var errorMessage = resultJson.error_message;
        var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
		// reusing restore dialog
        var dlg = new dialogClass('restore_mp_document_version_dialog');
        dlg.setTitle('Confirmation');
        dlg.setWidth(300);
        dlg.setPreference('sysparm_message', errorMessage);
        dlg.render();
    }
}
