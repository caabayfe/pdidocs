function getAllVersions() {
    var documentSysId = g_sysId;
    var actionName = 'Get All Versions of Document';
    var subFlowInputs = 'document_sys_id=' + documentSysId;
    
    var documentGR = new GlideRecord('mp_document');
	documentGR.get(documentSysId);
	var providerDetail = documentGR.provider_detail;
	subFlowInputs = subFlowInputs + ';' + 'provider_details_sys_id=' + providerDetail;
	
    var request = new GlideAjax('MultiProviderDocumentsManager');
    request.addParam('sysparm_name', 'updateDocument');
    request.addParam('sysparm_actionName', actionName);
    request.addParam('sysparm_documentSysId', documentSysId);
    request.addParam('sysparm_inputs_separated_by_semi_colon', subFlowInputs);
    request.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	//Ignoring response for now
    var answer = serverResponse.responseXML.documentElement.getAttribute("answer");
}
