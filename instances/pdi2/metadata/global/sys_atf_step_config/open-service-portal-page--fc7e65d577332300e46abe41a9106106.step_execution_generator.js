(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_OPENING = new GwtMessage().getMessage("Opening Service Portal page");
	var MESSAGE_KEY_SUCCESSFULY_OPENED = new GwtMessage().getMessage("Successfully opened Service Portal page");
	var MESSAGE_KEY_FAILED_TO_OPEN = new GwtMessage().getMessage("FAILURE: Failed to open Service Portal page");

	function ensurePageIsLoaded() {
		testStepIframeWindow = g_ui_testing_util.getTestIFrameWindow();
		if (testStepIframeWindow.document.querySelector("[sn-atf-area='404 message']") != null) {
			return failStep();
		}
		return passStep();
	}

	function passStep() {
		g_ui_testing_util.setTestStepStatusMessage(MESSAGE_KEY_SUCCESSFULY_OPENED);
		stepResult.success = true;
		stepResult.message = MESSAGE_KEY_SUCCESSFULY_OPENED;

		step.defer.resolve();
	}

	function failStep(msg) {
		var message = msg || MESSAGE_KEY_FAILED_TO_OPEN;

		g_ui_testing_util.setTestStepStatusMessage(message);

		stepResult.success = false;
		stepResult.message = message;

		step.defer.reject();
	}

	g_ui_testing_util.setTestStepStatusMessage(MESSAGE_KEY_OPENING);

	var portal = step.inputs.portal;
	var page = step.inputs.page;
	var query_params = JSON.parse(step.inputs.query_params || '{}');
	step.timeout = step.timeout || 5;
	var wait_timeout_ms = step.timeout * 1000;
	g_ui_testing_util.openPortalPage(portal.url_suffix, page.id, query_params, wait_timeout_ms)
			.then(ensurePageIsLoaded, failStep);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
