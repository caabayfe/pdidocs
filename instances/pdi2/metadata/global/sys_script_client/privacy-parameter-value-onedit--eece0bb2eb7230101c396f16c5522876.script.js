var callbackFunc;
function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
	callbackFunc = callback;
	var ga = new GlideAjax('global.PrivacyCoreValidator');
	ga.addParam('sysparm_name', 'validateParameterValues');
	ga.addParam('sysparm_techniqueParams', sysIDs);
	ga.addParam('sysparm_value', newValue);
	ga.getXMLAnswer(ajaxResponse); 
}

function ajaxResponse(serverResponse) { 
	if(serverResponse !== null && serverResponse !== '') {
		g_form.addErrorMessage(serverResponse);
		if (callbackFunc != null)
			callbackFunc(false);
	} else {
		g_form.clearMessages();
		if (callbackFunc != null)
			callbackFunc(true);
	}
}
