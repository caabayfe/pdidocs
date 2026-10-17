(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
    var MESSAGE_KEY_NAVIGATING_TO_MODULE = "Navigating to the '{0}' module in the '{1}' application";
	var MESSAGE_KEY_NO_MODULE_PROVIDED = "FAILURE: No module provided";
	var MESSAGE_KEY_MODULE_NOT_FOUND = "FAILURE: Unable to navigate to the '{0}' module in the '{1}' application. It was not visible in the application navigator";
	var MESSAGE_KEY_MODULE_URL_NOT_FOUND = "FAILURE: Unable to navigate to the '{0}' module in the '{1}' application. It does not have a URL";
	var MESSAGE_KEY_EXTERNAL_LINK_NOT_SUPPORTED = "FAILURE: Unable to navigate to the '{0}' module in the '{1}' application. Modules that link to external websites are not supported";
	var MESSAGE_KEY_JS_NOT_SUPPORTED = "FAILURE: Unable to navigate to the '{0}' module in the '{1}' application. Modules that execute client-side JavaScript are not supported";
	var MESSAGE_KEY_SUCCESSFULLY_NAVIGATED_TO_MODULE = "Successfully navigated to the '{0}' module in the '{1}' application";
	var MESSAGE_KEY_WAITING_FOR_TIMEOUT = "Waiting {0} seconds before completing the step";
	var messages = new GwtMessage().getMessages([MESSAGE_KEY_NAVIGATING_TO_MODULE, MESSAGE_KEY_NO_MODULE_PROVIDED, MESSAGE_KEY_MODULE_NOT_FOUND, MESSAGE_KEY_MODULE_URL_NOT_FOUND,
		MESSAGE_KEY_SUCCESSFULLY_NAVIGATED_TO_MODULE, MESSAGE_KEY_EXTERNAL_LINK_NOT_SUPPORTED, MESSAGE_KEY_JS_NOT_SUPPORTED, MESSAGE_KEY_WAITING_FOR_TIMEOUT]);

	if (!step.inputs.module) {
		failStep(messages[MESSAGE_KEY_NO_MODULE_PROVIDED]);
		return;
	}

	// make sure the titles are defined if the server did not provide them
	if (!step.inputs.module_title)
		step.inputs.module_title = step.inputs.module;
	if (!step.inputs.application_title)
		step.inputs.application_title = '';

	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messages[MESSAGE_KEY_NAVIGATING_TO_MODULE],
		[step.inputs.module_title, step.inputs.application_title]));
	var leftNavUtil = new ATFLeftNavUtil();
	leftNavUtil.getModule(step.inputs.module).then(function(moduleObj) {
		// module is not visible in the left nav
		if (!moduleObj) {
			failStep(formatMessage(messages[MESSAGE_KEY_MODULE_NOT_FOUND], [step.inputs.module_title, step.inputs.application_title]));
			return;
		}

		// module does not have a URL. For example, it could be a separator.
		var moduleURI = moduleObj.uri;
		if (!moduleURI) {
			failStep(formatMessage(messages[MESSAGE_KEY_MODULE_URL_NOT_FOUND], [step.inputs.module_title, step.inputs.application_title]));
			return;
		}

		// modules that link to external websites are not supported
		if (moduleObj.type === 'DOC_LINK' || moduleURI.indexOf('https://') === 0 || moduleURI.indexOf('http://') === 0) {
			failStep(formatMessage(messages[MESSAGE_KEY_EXTERNAL_LINK_NOT_SUPPORTED],
				[step.inputs.module_title, step.inputs.application_title]));
			return;
		}

		// modules that execute client-side javascript are not supported
		if (moduleURI.indexOf('javascript:') === 0) {
			failStep(formatMessage(messages[MESSAGE_KEY_JS_NOT_SUPPORTED], [step.inputs.module_title, step.inputs.application_title]));
			return;
		}

        // Page Inspector url prefix needs to be removed
		if (moduleURI.indexOf('atf_page_inspector') != -1)
			moduleURI = "/" + moduleURI.substr(moduleURI.indexOf('sysparm_url=') + 12);

		g_ui_testing_util.openURL(moduleURI).then(passStep);
	})['catch'](function (e) {
		var msg = (e && e.message) ? e.message : e;
		failStep(msg);
	});

	function passStep() {
		if (step.timeout > 0)
			g_ui_testing_util.setTestStepStatusMessage(formatMessage(messages[MESSAGE_KEY_WAITING_FOR_TIMEOUT], step.timeout));

		setTimeout(_passStep, step.timeout * 1000);

		function _passStep() {
			stepResult.success = true;
			stepResult.message = formatMessage(messages[MESSAGE_KEY_SUCCESSFULLY_NAVIGATED_TO_MODULE],
				[step.inputs.module_title, step.inputs.application_title]);
			step.defer.resolve();
		}
	}

	function failStep(msg) {
		stepResult.success = false;
		stepResult.message = msg;
		step.defer.reject();
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
