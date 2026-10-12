function buildUpgradePlanConfirm() {
	var gm = new GlideModal('upgrade_plan_builder_confirm_modal');
	gm.setTitle(getMessage('Are your apps ready to publish?'));
	gm.setWidth(450);
	gm.on('beforeclose', function(){
		if ($j('#confirmModalAction').val() == 'execute')
			buildUpgradePlan();
	});
	gm.render();
}

function buildUpgradePlan(confirmBoxChecked) {
	var ga = new GlideAjax('UpgradePlanProcessor');
	ga.addParam('sysparm_name', 'buildUpgradePlan');
	ga.getXML(handleBuildResponse);
}

function handleBuildResponse(response) {
	var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	if (result.errorMessage) {
		showErrorMessage(result.errorMessage);
		return;
	}

	new UpgradePlanProgressViewerUtil()
		.renderProgressViewer(new GwtMessage().getMessage('Build Upgrade Plan'), result.progressId);
}

function showErrorMessage(errorMessage) {
	var glideForm = typeof g_form === 'undefined' ? new GlideForm() : g_form; // support for list and form
	glideForm.addErrorMessage(errorMessage);
}
