function performInstallUpgradePlan() {
    var ga = new GlideAjax('UpgradePlanProcessor');
	ga.addParam('sysparm_name', 'installUpgradePlan');
	ga.addParam('sysparm_sysId', g_form.getUniqueValue());
	ga.getXML(handleInstallResponse);
}

function handleInstallResponse(response) {
    var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
    if (result.errorMessage) {
        showErrorMessage(result.errorMessage);
        return;
    }

    new UpgradePlanProgressViewerUtil()
        .renderProgressViewer(new GwtMessage().getMessage('Reinstall Upgrade Plan'), result.progressId);
}

function showErrorMessage(errorMessage) {
    var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form;
    glideForm.addErrorMessage(errorMessage);
}
