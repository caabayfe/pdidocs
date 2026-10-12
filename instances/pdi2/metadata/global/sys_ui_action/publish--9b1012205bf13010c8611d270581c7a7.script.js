function publishUpgradePlan() {	
	var ga = new GlideAjax('UpgradePlanProcessor');
	ga.addParam('sysparm_name', 'publishUpgradePlan');
	ga.addParam('sysparm_sysId', g_form.getUniqueValue());
	ga.getXML(handlePublishResponse);
}

function handlePublishResponse(response) {
	var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	if (result.errorMessage) {
		showErrorMessage(result.errorMessage);
		return;
	}
	
	new UpgradePlanProgressViewerUtil()
		.renderProgressViewer(new GwtMessage().getMessage('Publish Upgrade Plan'), result.progressId);
}

function showErrorMessage(errorMessage) {
	var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form; // support for list and form
	glideForm.addErrorMessage(errorMessage);
}
