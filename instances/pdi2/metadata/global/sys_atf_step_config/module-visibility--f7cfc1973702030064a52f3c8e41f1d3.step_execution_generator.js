(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_RUNNING_MODULE_VISIBILITY = "Verifying module visibility";
	var MESSAGE_KEY_INVALID_ASSERT_TYPE = "Invalid assert type {0}";
	var SUCCESS_MSG_MODULES_VISIBLE = "Successfully validated that the following modules were visible: {0}";
	var SUCCESS_MSG_MODULES_NOT_VISIBLE = "Successfully validated that the following modules were not visible: {0}";
	var SUCCESS_MSG_ONLY_MODULES_VISIBLE = "Successfully validated that only the following modules were visible: {0}";
	var SUCCESS_MSG_ONLY_MODULES_NOT_VISIBLE = "Successfully validated that only the following modules were not visible: {0}";
	var FAILURE_CALCULATING_NOT_VISIBLE = "Error calculating not visible modules";
	var FAILURE_MSG_MODULES_VISIBLE = "FAILURE: Expected the following modules to be visible but they were not visible: {0}";
	var FAILURE_MSG_MODULES_NOT_VISIBLE = "FAILURE: Expected the following modules to not be visible but they were visible: {0}";
	var FAILURE_MSG_ADDITIONAL_MODULES_NOT_VISIBLE = "FAILURE: Found additional modules that were not visible: {0}";
	var messages = new GwtMessage().getMessages([MESSAGE_KEY_RUNNING_MODULE_VISIBILITY,  MESSAGE_KEY_INVALID_ASSERT_TYPE, SUCCESS_MSG_MODULES_VISIBLE,
		SUCCESS_MSG_MODULES_NOT_VISIBLE, SUCCESS_MSG_ONLY_MODULES_VISIBLE, SUCCESS_MSG_ONLY_MODULES_NOT_VISIBLE, FAILURE_CALCULATING_NOT_VISIBLE,
		FAILURE_MSG_MODULES_VISIBLE, FAILURE_MSG_MODULES_NOT_VISIBLE, FAILURE_MSG_ADDITIONAL_MODULES_NOT_VISIBLE]);

	g_ui_testing_util.setTestStepStatusMessage(messages[MESSAGE_KEY_RUNNING_MODULE_VISIBILITY]);

	var visibleAssertionPassed = true;
	var notVisibleAssertionPassed = true;
	var leftNavUtil = new ATFLeftNavUtil();
	leftNavUtil.openNavigator(assertModuleVisibility, step.inputs.navigator);

	function assertModuleVisibility() {
		g_ui_testing_util.clearTestIFrameOnloadFunction();
		leftNavUtil.getLeftNavJSON(step.inputs.navigator).then(function(response) {
			var visibleMsg = runVisibleAssertions(response);
			var notVisibleMsg = runNotVisibleAssertions(response);
			var resultMsg = '';
			if ((visibleAssertionPassed && notVisibleAssertionPassed)
					|| (!visibleAssertionPassed && !notVisibleAssertionPassed))
				resultMsg = visibleMsg + (visibleMsg && notVisibleMsg ? '\n\n' : '') + notVisibleMsg;
			else if (!visibleAssertionPassed && notVisibleAssertionPassed)
				resultMsg = visibleMsg;
			else if (visibleAssertionPassed && !notVisibleAssertionPassed)
				resultMsg = notVisibleMsg;

			stepResult.message = resultMsg;
			stepResult.success = visibleAssertionPassed && notVisibleAssertionPassed;
			if (stepResult.success)
				step.defer.resolve();
			else
				step.defer.reject();
		})['catch'](function (e) {
			stepResult.success = false;
			stepResult.message = e;
			step.defer.reject();
		});
	}

	function runVisibleAssertions(leftNavJSON) {
		var msg = '';
		if (step.inputs.visible_modules) {
			var modules = step.inputs.visible_modules.split(',');
			switch (step.inputs.visible_assert_type) {
				case 'at_least_modules_visible':
					msg = assertAtLeastVisible(modules, leftNavJSON);
					break;
				case 'only_modules_visible':
					msg = assertOnlyVisible(modules, leftNavJSON);
					break;
				default:
					visibleAssertionPassed = false;
					msg = formatMessage(messages[MESSAGE_KEY_INVALID_ASSERT_TYPE], step.inputs.visible_assert_type);
					break;
			}
		}

		return msg;
	}

	function runNotVisibleAssertions(leftNavJSON) {
		var msg = '';
		if (step.inputs.not_visible_modules) {
			var modules = step.inputs.not_visible_modules.split(',');
			switch (step.inputs.not_visible_assert_type) {
				case 'at_least_modules_not_visible':
					msg = assertAtLeastNotVisible(modules, leftNavJSON);
					break;
				case 'only_modules_not_visible':
					msg = assertOnlyNotVisible(modules, leftNavJSON);
					break;
				default:
					notVisibleAssertionPassed = false;
					msg = formatMessage(messages[MESSAGE_KEY_INVALID_ASSERT_TYPE], step.inputs.not_visible_assert_type);
					break;
			}
		}

		return msg;
	}

	function assertAtLeastVisible(modules, leftNavJSON) {
		var modulesFound = leftNavUtil.findModules(modules, leftNavJSON, step.inputs.navigator);
		if (modulesFound.length == modules.length)
			return formatMessage(messages[SUCCESS_MSG_MODULES_VISIBLE], convertModuleIdsToTitles(modulesFound, true));

		// figure out which module(s) were not visible
		for (var i = 0; i < modulesFound.length; i += 1) {
			var index = modules.indexOf(modulesFound[i]);
			if (index != -1)
				modules.splice(index, 1);
		}

		visibleAssertionPassed = false;
		return formatMessage(messages[FAILURE_MSG_MODULES_VISIBLE], convertModuleIdsToTitles(modules, true));
	}

	function assertAtLeastNotVisible(modules, leftNavJSON) {
		var msg = '';
		var modulesFound = leftNavUtil.findModules(modules, leftNavJSON, step.inputs.navigator);
		if (modulesFound.length == 0)
			return formatMessage(messages[SUCCESS_MSG_MODULES_NOT_VISIBLE], convertModuleIdsToTitles(modules, false));

		notVisibleAssertionPassed = false;
		return formatMessage(messages[FAILURE_MSG_MODULES_NOT_VISIBLE], convertModuleIdsToTitles(modulesFound, false));
	}

	function assertOnlyVisible(modules, leftNavJSON) {
		var modulesJSON = leftNavUtil.getCollapsedModuleJSON(leftNavJSON, step.inputs.navigator);
		for (var i = 0; i < modulesJSON.length; i += 1) {
			var index = modules.indexOf(modulesJSON[i].id);
			if (index != -1) {
				modules.splice(index, 1);
				modulesJSON.splice(i, 1);
				i -= 1;
			}
		}

		if (modules.length == 0 && modulesJSON.length == 0)
			return formatMessage(messages[SUCCESS_MSG_ONLY_MODULES_VISIBLE], convertModuleIdsToTitles(step.inputs.visible_modules.split(','), true));

		var failureMsg = '';
		if (modules.length > 0)
			failureMsg += formatMessage(messages[FAILURE_MSG_MODULES_VISIBLE], convertModuleIdsToTitles(modules, true));

		if (modulesJSON.length > 0) {
			var failures = [];
			for (i = 0; i < modulesJSON.length; i += 1)
				failures.push(modulesJSON[i].title);

			failureMsg += (failureMsg ? ("\n\n") : "") + formatMessage(messages[FAILURE_MSG_MODULES_NOT_VISIBLE], failures.join(', '));
		}

		visibleAssertionPassed = false;
		return failureMsg;
	}

	function assertOnlyNotVisible(modules, leftNavJSON) {
		var modulesJSON = leftNavUtil.getCollapsedModuleJSON(leftNavJSON, step.inputs.navigator);
		var moduleIds = [];
		for (var i = 0 ; i < modulesJSON.length; i += 1)
			moduleIds.push(modulesJSON[i].id);

		var ga = new GlideAjax('ATFLeftNavUtil');
		ga.addParam('sysparm_name', 'getNotVisibleModules');
		ga.addParam('sysparm_visible_modules', moduleIds.join(','));
		ga.getXMLWait();
		var notVisibleModules = ga.getAnswer();
		if (!notVisibleModules) {
			notVisibleAssertionPassed = false;
			return messages[FAILURE_CALCULATING_NOT_VISIBLE];
		}

		notVisibleModules = JSON.parse(notVisibleModules);
		for (i = 0; i < notVisibleModules.length; i += 1) {
			var index = modules.indexOf(notVisibleModules[i].id);
			if (index != -1) {
				modules.splice(index, 1);
				notVisibleModules.splice(i, 1);
				i -= 1;
			}
		}

		if (modules.length == 0 && notVisibleModules.length == 0)
			return formatMessage(messages[SUCCESS_MSG_ONLY_MODULES_NOT_VISIBLE],
				convertModuleIdsToTitles(step.inputs.not_visible_modules.split(','), false));

		var failureMsg = '';
		if (modules.length > 0)
			failureMsg += formatMessage(messages[FAILURE_MSG_MODULES_NOT_VISIBLE],
				convertModuleIdsToTitles(modules, false));

		if (notVisibleModules.length > 0) {
			var failures = [];
			for (i = 0; i < notVisibleModules.length; i += 1)
				failures.push(notVisibleModules[i].title);

			failureMsg += (failureMsg ? ("\n\n") : "") + formatMessage(messages[FAILURE_MSG_ADDITIONAL_MODULES_NOT_VISIBLE], failures.join(', '));
		}

		notVisibleAssertionPassed = false;
		return failureMsg;
	}

	function convertModuleIdsToTitles(moduleIdArr, isVisibleAssertType) {
		var titleArr = isVisibleAssertType ? step.inputs.visible_module_titles : step.inputs.not_visible_module_titles;
		if (!titleArr)
			return moduleIdArr.join(', ');

		var moduleTitles = [];
		for (var i = 0; i < moduleIdArr.length; i += 1)
			moduleTitles.push(titleArr[moduleIdArr[i]]);

		return moduleTitles.join(', ');
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
