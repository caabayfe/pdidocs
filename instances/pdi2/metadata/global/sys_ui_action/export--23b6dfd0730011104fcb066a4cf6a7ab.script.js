function exportAsJson() {
	var ga = new GlideAjax('UpgradePlanProcessor');
	ga.addParam('sysparm_name', 'exportUpgradePlan');
	ga.addParam('sysparm_sysId', g_form.getUniqueValue());
	ga.addParam('sysparm_planName', g_form.getValue('name'));
	ga.addParam('sysparm_targetVersion', g_form.getValue('target_version'));
	ga.getXML(handleExportResponse);
}

function deleteAttachment(sysId) {
	var ga = new GlideAjax('UpgradePlanProcessor');
	ga.addParam('sysparm_name', 'deleteUpgradePlanAttachment');
	ga.addParam('sysparm_sysId', sysId);
	ga.getXML(handleDeleteResponse);
}

function handleExportResponse(response) {
	var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	if (result.errorMessage) {
		showErrorMessage(result.errorMessage);
		return;
	}
	var w = getTopWindow();
	var baseUrl = w.location.origin;
	var downloadUrl = baseUrl + '/sys_attachment.do?sys_id=' + result.sys_id;
	var downloadWindow = w.open(downloadUrl);
	downloadWindow.addEventListener('unload', function(){
		deleteAttachment(result.sys_id);
	});
}

function handleDeleteResponse(response) {
	var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	if (result.errorMessage) {
		showErrorMessage(result.errorMessage);
		return;
	}
}

function showErrorMessage(errorMessage) {
	var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form;
	glideForm.addErrorMessage(errorMessage);
}
