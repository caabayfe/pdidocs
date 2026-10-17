(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_OPENING = new GwtMessage().getMessage("Opening Service Portal page");
	var MESSAGE_KEY_SUCCESSFULY_OPENED = new GwtMessage().getMessage("Successfully opened Service Portal page");
	var MESSAGE_KEY_FAILED_TO_OPEN = new GwtMessage().getMessage("FAILURE: Failed to open Service Portal page");
	var MESSAGE_KEY_FAILED_NO_G_FORM = new GwtMessage().getMessage("FAILURE: g_form is not defined. A valid form must have g_form defined");
	var gFormCheckCount = 0;
	
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
	
	function ensureGform() {
		if (gFormCheckCount === 10) {
			return failStep(MESSAGE_KEY_FAILED_NO_G_FORM);
		}
		
		gFormCheckCount++;
		
		if (g_ui_testing_util.getTestIFrameWindow().g_form) {
			return passStep();
		}
		
		window.setTimeout(ensureGform, 2000);
	}
	
	g_ui_testing_util.setTestStepStatusMessage(MESSAGE_KEY_OPENING);
	
	var portal = step.inputs.portal;
	var page = step.inputs.page;
	var query_params = JSON.parse(step.inputs.query_params || '{}');
	query_params.table = step.inputs.table;
	step.timeout = step.timeout || 5;
	var wait_timeout_ms = step.timeout * 1000;
	query_params.sys_id = (step.inputs.param_sys_id) ? step.inputs.param_sys_id : - 1;
	if (step.inputs.param_view) {
		query_params.view = step.inputs.param_view;
	}
	
	g_ui_testing_util.openPortalPage(portal.url_suffix, page.id, query_params, wait_timeout_ms)
		.then(ensureGform, failStep);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
