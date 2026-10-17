(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var gs = new GwtMessage();
	
	var INIT_MESSAGE = gs.getMessage("Running UI action visibility test");
	var FAILED_NO_G_FORM = gs.getMessage("FAILURE: A valid form must be open before checking visibility of UI actions");
	var FAILED_NO_UI_ACTION = gs.getMessage("Please provide at least one UI action to assert visibility");
	
	function message(msg) {
		return g_ui_testing_util.setTestStepStatusMessage(msg);
	}

	function onSuccess(msg) {
		message(msg);
		stepResult.message = msg;
		stepResult.success = true;
		step.defer.resolve();
	}

	function onError(msg) {
		message(msg);
		stepResult.message = msg;
		stepResult.success = false;
		step.defer.reject();
	}

	function checkVisibility(inputVarObj) {
		var visible, state = false, msg = "", err=0;

		if (inputVarObj.ids) {
			var sysIds = inputVarObj.ids.split(",");
			for (var i = 0; i < sysIds.length; i++) {
				visible = isVisible(sysIds[i]);
				if ( (visible && inputVarObj.visible) || (!visible && !inputVarObj.visible) )
					state = true;
				else if ( (!visible && inputVarObj.visible) || (visible && !inputVarObj.visible) )
					state = false;

				msg += (msg ? ("\n") : "");
				if (state == true)
					msg += gs.getMessage("SUCCESS: UI action '{0}' {1}", step.inputs.ui_action_names[sysIds[i]], inputVarObj.okMsg);
				else {
					msg += gs.getMessage("FAILURE: UI action '{0}' {1}", step.inputs.ui_action_names[sysIds[i]], inputVarObj.errMsg);
					err++;
				}
			}
		}
		return {msg: msg, err: err};
	}

	function isVisible(actionId) {
		var document = jQuery(testFrameWindow.document);
		var q = "[gsft_id='" + actionId + "']";
		var el = document.find(q);
		if (el.length > 0 && el.is(':visible')) {
			return  true;
		}
		return false;
	}

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

	// Fail Step if there's no gForm
	if (!testFrameWindow.g_form) {
		onError(FAILED_NO_G_FORM);
		return;
	}

	// Initial message
	message(INIT_MESSAGE);

	if (!step.inputs.visible && !step.inputs.not_visible) {
		onError(FAILED_NO_UI_ACTION);
		return;
	}
	
	var states = {
		visible: 'is visible',
		not_visible: 'is not visible'
	};
	
	var inputs = [
		{ids: step.inputs.visible, visible: true, okMsg: states.visible, errMsg: states.not_visible},
		{ids: step.inputs.not_visible, visible: false, okMsg: states.not_visible, errMsg: states.visible}];

	var result, msg = "", err = 0;
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].ids) {
			result = checkVisibility(inputs[i]);
			msg += (msg ? ("\n") : "") + result.msg;
			err = err + result.err;
		}
	}
	
	if (err > 0) {
		onError(msg);
	} else {
		onSuccess(msg);
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
