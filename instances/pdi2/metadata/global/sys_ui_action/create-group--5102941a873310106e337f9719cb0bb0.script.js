function createGroup(){
	var permissionConfigSysid = g_sysId;
	var createGroupActionName = "Create Group";
	
	var request = new GlideAjax('MultiProviderDocumentsManager');
	request.addParam('sysparm_name', 'createGroup');
	request.addParam('sysparm_actionName', createGroupActionName);
	request.addParam('sysparm_permissionConfigSysId', permissionConfigSysid);
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
