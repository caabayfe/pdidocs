function reprocessUpgradePlan() {
    var ga = new GlideAjax('UpgradePlanProcessor');
    ga.addParam('sysparm_name', 'reprocessUpgradePlan');
    ga.addParam('sysparm_sysId', g_form.getUniqueValue());
    ga.getXMLAnswer(handleReprocessResponse);
}

function handleReprocessResponse(data) {
    var result = JSON.parse(data);
    if (result.errorMessage) {
        showErrorMessage(result.errorMessage);
        return;
    }

	new UpgradePlanProgressViewerUtil()
		.renderProgressViewer(new GwtMessage().getMessage('Reprocess Upgrade Plan'), result.progressId);
}

function showErrorMessage(errorMessage) {
    var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form; // support for list and form
    glideForm.addErrorMessage(errorMessage);
}
