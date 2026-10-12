(function (step, stepResult, assertionObject) {

	var MESSAGE_KEY_VALIDATING = "Running component state validation";
	var MESSAGE_KEY_FAILED_NO_G_AUTOMATE = "FAILURE: Unable to validate state, g_automate is not defined";
	var MESSAGE_KEY_FAILED_NO_COMPONENT = "FAILURE: Unable to validate state of component '{0}', component not found";
	var MESSAGE_KEY_FAILED_NO_METHOD = "FAILURE: Unable to validate state of component '{0}', method with name 'isDisabled' was not found";
	var MESSAGE_KEY_FAILED_ERROR = "FAILURE: Unable to validate state of component '{0}', error during method call";
	var MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE = "FAILURE: Unable to validate state of component '{0}'. Error during method call: {1}\n{2}";
	var MESSAGE_KEY_SUCCESS = "Successfully validated state of component '{0}' as {1}";
	var MESSAGE_KEY_FAILURE = "FAILURE: Expected state of component '{0}' to be {1} but was {2}";

	// init message map
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_VALIDATING, MESSAGE_KEY_FAILED_NO_G_AUTOMATE, MESSAGE_KEY_FAILED_NO_COMPONENT, MESSAGE_KEY_FAILED_NO_METHOD, MESSAGE_KEY_FAILED_ERROR, MESSAGE_KEY_SUCCESS, MESSAGE_KEY_FAILURE]);
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_VALIDATING]));
	
	//initiate gAutomate
	var gAutomate = window.top.g_automate;
	if (!gAutomate) {
		failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_G_AUTOMATE]));
		return;
	}

	// initialize user input and gAutomate info
	var mugshot = getMugshot(step.inputs.component);
	var mugshotLabel = JSON.parse(mugshot).sn_atf_mugshot_short_description;
	var mugshotLongDesc = JSON.parse(mugshot).sn_atf_mugshot_long_description;

	assertionObject.beforeExecuteStep = function() {
		var defer = g_ui_testing_util.q().defer();
		gAutomate.findComponent(mugshot)
		.then(function(componentObj) {
			var component = componentObj.component;
			if (!component)
				return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc));

			return defer.resolve();
		})
		.catch(function(error) {
			if (error.message === "component_not_found")
				return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc));
			else if (error.message && error.stack)
				return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE], mugshotLongDesc, error.message, error.stack));

			return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], mugshotLongDesc));
		});

		return defer.promise;
	};

	assertionObject.executeStep = function(step, stepResult) {
		gAutomate.scrollIntoView(mugshot)
		.then(function() {
			var assertType = step.inputs.assert_type;
			gAutomate.isDisabled(mugshot)
			.then(function(answer) {
				if (assertType === "read_only" || assertType === "disabled") {
					if (answer)
						return passStep(formatMessage(messageMap[MESSAGE_KEY_SUCCESS], mugshotLabel, assertType.replace("_", " ")));
					else
						return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILURE], mugshotLongDesc, assertType.replace("_", " "), assertType === "read_only" ? "editable" : "enabled"));
				} else if (assertType === "editable" || assertType === "enabled") {
					if (!answer)
						return passStep(formatMessage(messageMap[MESSAGE_KEY_SUCCESS], mugshotLabel, assertType));
					else
						return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILURE], mugshotLongDesc, assertType, assertType === "editable" ? "read only" : "disabled"));
				}
			})
			.catch(function(error) {
				handleFailure(error);
			});
		});
	};

	function getMugshot(componentHash){
		var mugshots = step.mugshots_cache_json ? JSON.parse(step.mugshots_cache_json):{};
		return mugshots[componentHash] || componentHash;
	}

	function handleFailure(error) {
		switch (error.message) {
			case "component_not_found":
				failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc));
				return;
			case "method_not_supported":
				failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_METHOD], mugshotLongDesc));
				return;
			default:
				failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], mugshotLongDesc));
				return;
		}
	}

	function passStep(reason) {
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = true;
		stepResult.message += (stepResult.message ? ("\n") : "") + reason;
		step.defer.resolve();
	}

	function failStep(reason) {
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		stepResult.message += (stepResult.message ? ("\n") : "") + reason;
		step.defer.reject();
	}

	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
