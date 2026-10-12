(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var msg = {error: '', success: ''};

	function updateMsg(type, message) {
		msg[type] += (msg[type] ? ("\n") : "") + message;
	}

	function onError(msg) {
		stepResult.message = msg;
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = false;
		step.defer.reject();
	}

	function onSuccess(msg) {
		stepResult.message = msg;
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = true;
		step.defer.resolve();
	}

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

	// Fail Step if there's no gForm
	if (!testFrameWindow.g_form) {
		failStep(new GwtMessage().getMessage("FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before setting values"));
		return;
	}

	var inputOptions = {
		visible: {field: "visible", action: "isVisible", result: true, failure: "not visible"},
		not_visible: {field: "not visible", action: "isVisible", result: false, failure: "visible"},
		read_only:{field: "read only", action: "isReadOnly", result: true, failure: "not read only"},
		not_read_only:{field: "not read only", action:"isReadOnly", result: false, failure: "read only"},
		mandatory: {field: "mandatory", action: "isMandatory", result: true, failure: "not mandatory"},
		not_mandatory: {field: "not mandatory", action: "isMandatory", result: false, failure: "mandatory"}
	};

	var message, opts, fields, field;
	var errors = 0;
	for (var inputName in inputOptions) {
		opts = inputOptions[inputName];
		fields = step.inputs[inputName].split(",");
		
		for (var i = 0; i < fields.length; i++) {
			field = fields[i];
			
			if (field.length > 0) {
				if (opts.result !== testFrameWindow.g_form[opts.action](field)) {
					errors++;
					updateMsg('error', new GwtMessage().getMessage("FAILURE: Expected field '{0}' to be {1} but it was {2}", field, opts.field, opts.failure));
				} else {
					updateMsg('success', new GwtMessage().getMessage("Confirmed that Expected field '{0}' is {1}", field, opts.field));
				}
			}
		}

	}

	if (errors) {
		onError(msg.error);
	} else {
		onSuccess(msg.success);
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
