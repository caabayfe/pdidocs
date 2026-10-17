(function (step, stepResult, assertionObject) {

	var MESSAGE_KEY_SETTING = "Setting values";
	var MESSAGE_KEY_FAILED_NO_G_AUTOMATE = "FAILURE: Unable to set values, g_automate is not defined";
	var MESSAGE_KEY_FAILED_NO_COMPONENT = "FAILURE: Unable to set component '{0}' to value '{1}', component not found";
	var MESSAGE_KEY_FAILED_NO_METHOD = "FAILURE: Unable to set component '{0}' to value '{1}', method with name 'setValue' was not found";
	var MESSAGE_KEY_FAILED_READ_ONLY = "FAILURE: Unable to set component '{0}' to value '{1}', it is read only";
	var MESSAGE_KEY_FAILED_J_QUERY_MISSING = "FAILURE: Unable to set component '{0}' to value '{1}', unable to locate jQuery on the page";
	var MESSAGE_KEY_FAILED_VALUE_NOT_FOUND = "FAILURE: Unable to set component '{0}' to value '{1}', value or option not found";
	var MESSAGE_KEY_FAILED_SELECT2_DROPDOWN_NOT_FOUND = "FAILURE: Unable to set the component '{0}' to value '{1}', the options dropdown did not appear";
	var MESSAGE_KEY_FAILED_ERROR = "FAILURE: Unable to set component '{0}' to value '{1}', error during method call";
	var MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE = "FAILURE: Unable to set component '{0}' to value '{1}'. Error during method call: {2}\n{3}";
	var MESSAGE_KEY_SUCCESSFULLY_SET = "Successfully set component '{0}' to value '{1}'";
	// init message map
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SETTING, MESSAGE_KEY_FAILED_NO_G_AUTOMATE, MESSAGE_KEY_FAILED_NO_COMPONENT, MESSAGE_KEY_FAILED_NO_METHOD, MESSAGE_KEY_FAILED_READ_ONLY, MESSAGE_KEY_FAILED_J_QUERY_MISSING, MESSAGE_KEY_FAILED_VALUE_NOT_FOUND, MESSAGE_KEY_FAILED_SELECT2_DROPDOWN_NOT_FOUND, MESSAGE_KEY_FAILED_ERROR, MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE, MESSAGE_KEY_SUCCESSFULLY_SET]);
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_SETTING]));

	var gAutomate = window.top.g_automate;
	if (!gAutomate) {
		failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_G_AUTOMATE]));
		return;
	}

	function getMugshot(componentHash){
		var mugshots = step.mugshots_cache_json ? JSON.parse(step.mugshots_cache_json):{};
		return mugshots[componentHash] || componentHash;
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
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], componentLongDesc, value));
				else if (!(component instanceof SettableComponent))
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], componentLongDesc, value));
				else
					resolve();
			})
			.catch(function(error) {
				if (error.message === "component_not_found")
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], componentLongDesc, value));
				else if (error.message && error.stack)
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE], componentLongDesc, value, error.message, error.stack));
				else
					reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], componentLongDesc, value));
			});
		});
	}

	assertionObject.executeStep = function () {
		var terms = parseEncodedQuery();
		return terms.reduce(function(prev, curr, i, arr) {
			return prev.then(function() {
				return setComponentValue(arr[i]);
			});
		}, Promise.resolve())
		.then(passStep, failStep);
	};

	function setComponentValue(term) {
		return new Promise(function(resolve, reject) {
			var mugshotHash = term['mugshotHash'];
			var mugshot = getMugshot(mugshotHash);
			var mugshotObj = JSON.parse(mugshot);
			var mugshotLabel = mugshotObj.sn_atf_mugshot_short_description;
			var mugshotLongDesc = mugshotObj.sn_atf_mugshot_long_description;
			var value = term['value'];

			// GEM pills dropped in a checkbox resolve to "0"/"1", but g_automate expects "true"/"false"
			if (mugshotObj["type"] === "checkbox") {
				if (value === "1")
					value = "true";

				if (value === "0")
					value = "false";
			}

			gAutomate.scrollIntoView(mugshot)
			.then(function() {
				gAutomate.setValue(mugshot, value)
				.then(function() {
					updateSetValueStepResultMessage(formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_SET], mugshotLabel, value));
					return resolve();
				})
				.catch(function(error) {
					switch (error.message) {
						case "component_not_found":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_COMPONENT], mugshotLongDesc, value));
						case "method_not_supported":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_METHOD], mugshotLongDesc, value));
						case "component_read_only":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_READ_ONLY], mugshotLongDesc, value));
						case "j_query_missing":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_J_QUERY_MISSING], mugshotLongDesc, value));
						case "cannot_find_value":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_VALUE_NOT_FOUND], mugshotLongDesc, value));
						case "select2_dropdown_missing":
							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_SELECT2_DROPDOWN_NOT_FOUND], mugshotLongDesc, value));
						default:
							if (error.message && error.stack)
								return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR_WITH_MESSAGE], mugshotLongDesc, value, error.message, error.stack));

							return reject(formatMessage(messageMap[MESSAGE_KEY_FAILED_ERROR], mugshotLongDesc, value));
					}
				});
			});
		});
	}

	function updateSetValueStepResultMessage(message) {
		stepResult.message += (stepResult.message ? ("\n") : "") + message;
	}

	function passStep() {
		stepResult.success = true;
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

}(step, stepResult, assertionObject));
