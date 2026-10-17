(function executeStep(step, stepResult, assertionObject) {
	var MESSAGE_KEY_CLICKING = "Clicking component";
	var MESSAGE_KEY_FAILED_NO_G_AUTOMATE = "FAILURE: Unable to click component, g_automate is not defined";
	var MESSAGE_KEY_FAILED_NO_DEFAULT_AREA = "FAILURE: Unable to click component, default area is not defined";

	var MESSAGE_KEY_FAILED_NO_COMPONENT = "FAILURE: Unable to click component '{0}', component not found";
	var MESSAGE_KEY_FAILED_NO_CLICK_FUNC = "FAILURE: Unable to click component '{0}', component does not have 'click' function";
	var MESSAGE_KEY_FAILED_NO_METHOD = "FAILURE: Unable to click component '{0}', method with name 'click' was not found";
	var MESSAGE_KEY_FAILED_ERROR = "FAILURE: Unable to click component '{0}', error during method call";
	var MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE = "FAILURE: Unable to click component '{0}'. Error during method call: {1}\n{2}";
	var MESSAGE_KEY_SUCCESSFULLY_CLICKED = "Successfully clicked component '{0}'";
	var MESSAGE_KEY_COMPONENT_DISABLED = "FAILURE: Unable to click component, component is disabled";
	// init message map
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_CLICKING, MESSAGE_KEY_FAILED_NO_G_AUTOMATE, MESSAGE_KEY_FAILED_NO_DEFAULT_AREA, MESSAGE_KEY_FAILED_NO_COMPONENT, MESSAGE_KEY_FAILED_NO_CLICK_FUNC, MESSAGE_KEY_FAILED_NO_METHOD, MESSAGE_KEY_FAILED_ERROR, MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE, MESSAGE_KEY_SUCCESSFULLY_CLICKED, MESSAGE_KEY_COMPONENT_DISABLED]);
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_CLICKING]));

	var mugshot = getMugshot(step.inputs.component);
	var mugshotLabel = JSON.parse(mugshot).sn_atf_mugshot_short_description;
	var mugshotLongDesc = JSON.parse(mugshot).sn_atf_mugshot_long_description;

	var gAutomate = window.top.g_automate;
	if (!gAutomate) {
		failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_G_AUTOMATE]));
		return;
	}

	assertionObject.beforeExecuteStep = function() {
		var defer = g_ui_testing_util.q().defer();
		gAutomate.findComponent(mugshot)
		.then(function(componentObj) {
			var component = componentObj.component;
			if (!component)
				return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc));

			if (!(component instanceof ClickableComponent))
				return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_CLICK_FUNC], mugshotLongDesc));

			// check if the component is disabled
			gAutomate.isDisabled(mugshot)
			.then(function(isDisabled) {
				if (isDisabled)
					return defer.reject(formatMessage(messageMap[MESSAGE_KEY_COMPONENT_DISABLED]));

				defer.resolve();
			})
			.catch(function(error) {
				return defer.reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], mugshotLongDesc));
			});
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
			gAutomate.click(mugshot)
			.then(function() {
				stepResult.success = true;
				stepResult.message = formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_CLICKED], mugshotLabel);
				return step.defer.resolve();
			})
			.catch(function(error) {
				switch (error.message) {
					case "component_not_found":
						return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc));
					case "no_click_function":
						return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_CLICK_FUNC], mugshotLongDesc));
					case "method_not_supported":
						return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_METHOD], mugshotLongDesc));
					default:
						if (error.message && error.stack)
							return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE], mugshotLongDesc, error.message, error.stack));

						return failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], mugshotLongDesc));
				}
			});
		});
	};

    // Click action can potentially mutate the page
	assertionObject.canMutatePage = step.can_mutate_page;

	function getMugshot(componentHash){
		var mugshots = step.mugshots_cache_json ? JSON.parse(step.mugshots_cache_json):{};
		return mugshots[componentHash] || componentHash;
	}

	function failStep(reason) {
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		stepResult.message += (stepResult.message ? ("\n") : "") + reason;
		step.defer.reject();
	}
}(step, stepResult, assertionObject));
