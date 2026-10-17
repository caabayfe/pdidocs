function callDeleteDocumentVersion() {
    // current selected row sys_id
    var documentVersionSysId = g_sysId;

    var deleteActionName = 'Delete Document Version';
    var subFlowInputs = "document_version_sys_id=" + documentVersionSysId;
	
	var docVerGR = new GlideRecord('mp_document_version');
	docVerGR.get(documentVersionSysId);
	var documentId = docVerGR.document;

	var documentGR = new GlideRecord('mp_document');
	documentGR.get(documentId);
	var providerDetailSysId = documentGR.provider_detail;
	subFlowInputs = subFlowInputs + ';' + 'provider_detail_sys_id=' + providerDetailSysId + ';' + 'delete_attachment=true';
   
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_mp_document_version_dialog');

    dlg.setTitle('Confirmation');
    dlg.setWidth(300);
    dlg.setPreference('sysparm_actionName', deleteActionName);
	dlg.setPreference('sysparm_document_version_sys_id', documentVersionSysId);
    dlg.setPreference('sysparm_inputs_separated_by_semi_colon', subFlowInputs);
    dlg.render();
}


function ajaxResponse(serverResponse) {
    // Ignoring response for now
    var answer1 = serverResponse.responseXML.documentElement.getAttribute("answer");
}
