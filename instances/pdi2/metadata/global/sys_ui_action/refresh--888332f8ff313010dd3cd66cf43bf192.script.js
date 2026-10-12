function refreshUpgradePlanConfirm() {
	var gm = new GlideModal('upgrade_plan_refresher_confirm_modal');
	gm.setTitle('Are your apps ready to publish?');
	gm.setWidth(450);
	gm.on('beforeclose', function(){
		if ($j('#confirmModalAction').val() == 'execute')
			refreshUpgradePlan();
	});
	gm.render();
}

function refreshUpgradePlan() {
	var ga = new GlideAjax('UpgradePlanProcessor');
	ga.addParam('sysparm_name', 'refreshUpgradePlan');
	ga.getXML(handleRefreshResponse);
}

function handleRefreshResponse(response) {
	var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	if (result.errorMessage) {
		showErrorMessage(result.errorMessage);
		return;
	}

	new UpgradePlanProgressViewerUtil()
		.renderProgressViewer(new GwtMessage().getMessage('Refresh Upgrade Plan'), result.progressId);
}

function showErrorMessage(errorMessage) {
	var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form; // support for list and form
	glideForm.addErrorMessage(errorMessage);
}
