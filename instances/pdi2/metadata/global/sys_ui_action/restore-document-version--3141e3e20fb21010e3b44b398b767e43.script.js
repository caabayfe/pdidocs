function callRestoreDocumentVersion() {
    var documentVersionSysId = g_sysId;
    var deleteActionName = 'Restore Version of Document';
    var subFlowInputs = "version_sys_id=" + documentVersionSysId;

    var docVerGR = new GlideRecord('mp_document_version');
    docVerGR.get(documentVersionSysId);
    var documentId = docVerGR.document;

    var documentGR = new GlideRecord('mp_document');
    documentGR.get(documentId);
    var providerDetailSysId = documentGR.provider_detail;
    subFlowInputs = subFlowInputs + ';' + 'provider_detail_sys_id=' + providerDetailSysId;

    var request = new GlideAjax('MultiProviderDocumentsManager');
    request.addParam('sysparm_name', 'updateDocumentVersion');
    request.addParam('sysparm_document_version_sys_id', documentVersionSysId);
    request.addParam('sysparm_actionName', deleteActionName);
    request.addParam('sysparm_inputs_separated_by_semi_colon', subFlowInputs);

    request.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
    var answer = serverResponse.responseXML.documentElement.getAttribute('answer');
    var resultJson = JSON.parse(answer);    
    if (resultJson && resultJson.error_message) {
        var errorMessage = resultJson.error_message;
        var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
        var dlg = new dialogClass('restore_mp_document_version_dialog');
        dlg.setTitle('Confirmation');
        dlg.setWidth(300);
        dlg.setPreference('sysparm_message', errorMessage);
        dlg.render();
    }
}
