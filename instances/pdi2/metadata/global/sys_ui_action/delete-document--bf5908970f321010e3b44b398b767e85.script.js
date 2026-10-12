function confirmAndDeleteDocument() {
    var documentSysId = g_sysId;
	var docGR = new GlideRecord('mp_document');
	docGR.get(documentSysId);
	var providerDetail = docGR.provider_detail;

    var actionName = 'Delete Document';
    var subFlowInputs = 'document_sys_id=' + documentSysId;
    subFlowInputs = subFlowInputs + ';' + 'provider_details_sys_id=' + providerDetail + ';' + 'delete_attachments=true';
	
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var dlg = new dialogClass('delete_mp_document_dialog');

	dlg.setTitle('Confirmation');
	dlg.setWidth(300);
	dlg.setPreference('sysparm_actionName', actionName);
	dlg.setPreference('sysparm_documentSysId', documentSysId);
	dlg.setPreference('sysparm_inputs_separated_by_semi_colon', subFlowInputs);
	dlg.render();
}
