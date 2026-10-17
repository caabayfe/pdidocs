(function (step, stepResult, assertionObject) {

	var MESSAGE_KEY_Validating = "Validating values";
	var MESSAGE_KEY_FAILED_NO_G_AUTOMATE = "FAILURE: Unable to validate value, g_automate is not defined";
	var MESSAGE_KEY_FAILED_NO_COMPONENT = "FAILURE: Unable to validate value of component '{0}', component not found";
	var MESSAGE_KEY_FAILED_NO_METHOD = "FAILURE: Unable to validate value of component '{0}', method with name 'getValue' was not found";
	var MESSAGE_KEY_FAILED_J_QUERY_MISSING = "FAILURE: Unable to validate value of component '{0}', unable to locate jQuery on the page";
	var MESSAGE_KEY_FAILED_ERROR = "FAILURE: Unable to validate value of component '{0}', error during method call";
	var MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE = "FAILURE: Unable to validate value of component '{0}'. Error during method call: {1}\n{2}";
	var MESSAGE_KEY_SUCCESSFULLY_VALIDATED = "Successfully validated the following values:{0}";
	var MESSAGE_KEY_VALIDATION_EQUALITY = "'{0}' = {1}";
	var MESSAGE_KEY_FAILED_VALIDATION = "FAILURE: Expected the value of component '{0}' to be '{1}' but it was '{2}'";
	// init message map
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_Validating, MESSAGE_KEY_FAILED_NO_G_AUTOMATE, MESSAGE_KEY_FAILED_NO_COMPONENT, MESSAGE_KEY_FAILED_NO_METHOD, MESSAGE_KEY_FAILED_J_QUERY_MISSING, MESSAGE_KEY_FAILED_ERROR, MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE, MESSAGE_KEY_SUCCESSFULLY_VALIDATED, MESSAGE_KEY_FAILED_VALIDATION, MESSAGE_KEY_VALIDATION_EQUALITY]);
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_Validating]));

	var gAutomate = window.top.g_automate;
	if (!gAutomate) {
		failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_G_AUTOMATE]));
		return;
	}

	assertionObject.beforeExecuteStep = function () {
		var terms = parseEncodedQuery();
		// see: https://stackoverflow.com/a/38003741
		// TODO: Promise.resolve() isn't supported on IE. Use defer? or polyfill?
		return terms.reduce(function(prev, curr, i, arr) {
			return prev.then(function() {
				return checkComponentExists(arr[i]);
			});
		}, Promise.resolve());
	};

	function checkComponentExists(term) {
		return new Promise(function(resolve, reject) {
			var mugshotHash = term['mugshotHash'];
			var mugshot = getMugshot(mugshotHash);
			var componentLongDesc = JSON.parse(mugshot).sn_atf_mugshot_long_description;
			var value = term['value'];
			gAutomate.findComponent(mugshot)
			.then(function(componentObj) {
				var component = componentObj.component;
				if (!component)
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], componentLongDesc));
				else if (!(component instanceof GettableComponent))
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], componentLongDesc));
				else
					resolve();
			})
			.catch(function(error) {
				if (error.message === "component_not_found")
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], componentLongDesc));
				else if (error.message && error.stack)
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE], componentLongDesc, error.message, error.stack));
				else
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], componentLongDesc));
			});
		});
	}

	function getMugshot(componentHash){
		var mugshots = step.mugshots_cache_json ? JSON.parse(step.mugshots_cache_json):{};
		return mugshots[componentHash] || componentHash;
	}

	var validatedMugshots = '';

	assertionObject.executeStep = function() {
		validatedMugshots = '';
		var terms = parseEncodedQuery();
		return terms.reduce(function(prev, curr, i, arr) {
			return prev.then(function() {
				return assertComponentValue(arr[i]);
			});
		}, Promise.resolve())
		.then(passStep, failStep);
	};

	function assertComponentValue(term) {
		return new Promise(function(resolve, reject) {
			var mugshotHash = term['mugshotHash'];
			var mugshot = getMugshot(mugshotHash);
			var mugshotObj = JSON.parse(mugshot);
			var mugshotLabel = mugshotObj.sn_atf_mugshot_short_description;
			var mugshotLongDesc = mugshotObj.sn_atf_mugshot_long_description;
			var expectedValue = term['value'];
			// convert newline variations to \n
			expectedValue = expectedValue.replace(/(\r\n|\n|\r)/gm, "\n");

			// GEM pills dropped in a checkbox resolve to "0"/"1", but g_automate returns "true"/"false"
			if (mugshotObj["type"] === "checkbox") {
				if (expectedValue === "1")
					expectedValue = "true";

				if (expectedValue === "0")
					expectedValue = "false";
			}

			gAutomate.scrollIntoView(mugshot)
			.then(function() {
				gAutomate.getValue(mugshot)
				.then(function(answer) {
					if (answer == expectedValue) {
						validatedMugshots += "\n" + formatMessage(messageMap[MESSAGE_KEY_VALIDATION_EQUALITY], mugshotLabel, expectedValue);
						return resolve();
					} else
						return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_VALIDATION], mugshotLongDesc, expectedValue, answer));
				})
				.catch(function(error) {
					switch (error.message) {
						case "component_not_found":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc));
						case "method_not_supported":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_METHOD], mugshotLongDesc));
						case "j_query_missing":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_J_QUERY_MISSING], mugshotLongDesc));
						default:
							if (error.message && error.stack)
								return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE], mugshotLongDesc, error.message, error.stack));

							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], mugshotLongDesc));
					}
				});
			});
		});
	}

	function passStep() {
		stepResult.success = true;
		stepResult.message = formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_VALIDATED], validatedMugshots);
		step.defer.resolve();
	}

	function failStep(reason) {
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		stepResult.message += (stepResult.message ? ("\n") : "") + reason;
		step.defer.reject();
	}

	function parseEncodedQuery() {
		var values = step.inputs.component_values.split('^');
		var terms = [];
		for (var i = 0; i < values.length - 1; i += 1) {
			var value = values[i];
			// the "value" is structured as "<hash>=<hashValue>", so split on the "=" to extract the hash and hashValues
			var hash = value.slice(0, value.indexOf('='));
			var hashValue = value.slice(value.indexOf('=') + 1);
			terms.push({mugshotHash: hash, value: hashValue});
		}

		return terms;
	}

	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
