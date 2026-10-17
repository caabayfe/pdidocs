(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
    var MESSAGE_KEY_RUNNING_APPLICATION_VISIBILITY = "Verifying application menu visibility";
	var MESSAGE_KEY_INVALID_ASSERT_TYPE = "Invalid assert type {0}";
	var SUCCESS_MSG_APPS_VISIBLE = "Successfully validated that the following application menus were visible: {0}";
	var SUCCESS_MSG_APPS_NOT_VISIBLE = "Successfully validated that the following application menus were not visible: {0}";
	var SUCCESS_MSG_ONLY_APPS_VISIBLE = "Successfully validated that only the following application menus were visible: {0}";
	var SUCCESS_MSG_ONLY_APPS_NOT_VISIBLE = "Successfully validated that only the following application menus were not visible: {0}";
	var FAILURE_CALCULATING_NOT_VISIBLE = "Error calculating not visible application menus";
	var FAILURE_MSG_APPS_VISIBLE = "FAILURE: Expected the following application menus to be visible but they were not visible: {0}";
	var FAILURE_MSG_APPS_NOT_VISIBLE = "FAILURE: Expected the following application menus to not be visible but they were visible: {0}";
	var FAILURE_MSG_ADDITIONAL_APPS_NOT_VISIBLE = "FAILURE: Found additional application menus that were not visible: {0}";
	var messages = new GwtMessage().getMessages([MESSAGE_KEY_RUNNING_APPLICATION_VISIBILITY,  MESSAGE_KEY_INVALID_ASSERT_TYPE,
		SUCCESS_MSG_APPS_VISIBLE, SUCCESS_MSG_APPS_NOT_VISIBLE, SUCCESS_MSG_ONLY_APPS_VISIBLE, SUCCESS_MSG_ONLY_APPS_NOT_VISIBLE,
		FAILURE_CALCULATING_NOT_VISIBLE, FAILURE_MSG_APPS_VISIBLE, FAILURE_MSG_APPS_NOT_VISIBLE, FAILURE_MSG_ADDITIONAL_APPS_NOT_VISIBLE]);

	g_ui_testing_util.setTestStepStatusMessage(messages[MESSAGE_KEY_RUNNING_APPLICATION_VISIBILITY]);

	var visibleAssertionPassed = true;
	var notVisibleAssertionPassed = true;
	var leftNavUtil = new ATFLeftNavUtil();
	leftNavUtil.openNavigator(assertApplicationVisibility, step.inputs.navigator);

	function assertApplicationVisibility() {
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
		if (step.inputs.visible_applications) {
			var apps = step.inputs.visible_applications.split(',');
			switch (step.inputs.visible_assert_type) {
				case 'at_least_applications_visible':
					msg = assertAtLeastVisible(apps, leftNavJSON);
					break;
				case 'only_applications_visible':
					msg = assertOnlyVisible(apps, leftNavJSON);
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
		if (step.inputs.not_visible_applications) {
			var apps = step.inputs.not_visible_applications.split(',');
			switch (step.inputs.not_visible_assert_type) {
				case 'at_least_applications_not_visible':
					msg = assertAtLeastNotVisible(apps, leftNavJSON);
					break;
				case 'only_applications_not_visible':
					msg = assertOnlyNotVisible(apps, leftNavJSON);
					break;
				default:
					notVisibleAssertionPassed = false;
					msg = formatMessage(messages[MESSAGE_KEY_INVALID_ASSERT_TYPE], step.inputs.not_visible_assert_type);
					break;
			}
		}

		return msg;
	}

	function assertAtLeastVisible(apps, leftNavJSON) {
		var appsFound = leftNavUtil.findApplications(apps, leftNavJSON);
		if (appsFound.length == apps.length)
			return formatMessage(messages[SUCCESS_MSG_APPS_VISIBLE], convertAppIdsToTitles(appsFound, true));

		// figure out which application(s) were not visible
		for (var i = 0; i < appsFound.length; i += 1) {
			var index = apps.indexOf(appsFound[i]);
			if (index != -1)
				apps.splice(index, 1);
		}

		visibleAssertionPassed = false;
		return formatMessage(messages[FAILURE_MSG_APPS_VISIBLE], convertAppIdsToTitles(apps, true));
	}

	function assertAtLeastNotVisible(apps, leftNavJSON) {
		var msg = '';
		var appsFound = leftNavUtil.findApplications(apps, leftNavJSON);
		if (appsFound.length == 0)
			return formatMessage(messages[SUCCESS_MSG_APPS_NOT_VISIBLE], convertAppIdsToTitles(apps, false));

		notVisibleAssertionPassed = false;
		return formatMessage(messages[FAILURE_MSG_APPS_NOT_VISIBLE], convertAppIdsToTitles(appsFound, false));
	}

	function assertOnlyVisible(apps, leftNavJSON) {
		for (var i = 0; i < leftNavJSON.length; i += 1) {
			var index = apps.indexOf(leftNavJSON[i].id);
			if (index != -1) {
				apps.splice(index, 1);
				leftNavJSON.splice(i, 1);
				i -= 1;
			}
		}

		if (apps.length == 0 && leftNavJSON.length == 0)
			return formatMessage(messages[SUCCESS_MSG_ONLY_APPS_VISIBLE], convertAppIdsToTitles(step.inputs.visible_applications.split(','), true));

		var failureMsg = '';
		if (apps.length > 0)
			failureMsg += formatMessage(messages[FAILURE_MSG_APPS_VISIBLE], convertAppIdsToTitles(apps, true));

		if (leftNavJSON.length > 0) {
			var failures = [];
			for (i = 0; i < leftNavJSON.length; i += 1) {
				if (step.inputs.navigator === 'polaris')
					failures.push(leftNavJSON[i].label);
				else
					failures.push(leftNavJSON[i].title);
			}

			failureMsg += (failureMsg ? ("\n\n") : "") + formatMessage(messages[FAILURE_MSG_APPS_NOT_VISIBLE], failures.join(', '));
		}

		visibleAssertionPassed = false;
		return failureMsg;
	}

	function assertOnlyNotVisible(apps, leftNavJSON) {
		var appIds = [];
		for (var i = 0 ; i < leftNavJSON.length; i += 1)
			appIds.push(leftNavJSON[i].id);

		var ga = new GlideAjax('ATFLeftNavUtil');
		ga.addParam('sysparm_name', 'getNotVisibleApplications');
		ga.addParam('sysparm_visible_applications', appIds.join(','));
		ga.getXMLWait();
		var notVisibleApps = ga.getAnswer();
		if (!notVisibleApps) {
			notVisibleAssertionPassed = false;
			return messages[FAILURE_CALCULATING_NOT_VISIBLE];
		}

		notVisibleApps = JSON.parse(notVisibleApps);
		for (i = 0; i < notVisibleApps.length; i += 1) {
			var index = apps.indexOf(notVisibleApps[i].id);
			if (index != -1) {
				apps.splice(index, 1);
				notVisibleApps.splice(i, 1);
				i -= 1;
			}
		}

		if (apps.length == 0 && notVisibleApps.length == 0)
			return formatMessage(messages[SUCCESS_MSG_ONLY_APPS_NOT_VISIBLE],
				convertAppIdsToTitles(step.inputs.not_visible_applications.split(','), false));

		var failureMsg = '';
		if (apps.length > 0)
			failureMsg += formatMessage(messages[FAILURE_MSG_APPS_NOT_VISIBLE],
				convertAppIdsToTitles(apps, false));

		if (notVisibleApps.length > 0) {
			var failures = [];
			for (i = 0; i < notVisibleApps.length; i += 1)
				failures.push(notVisibleApps[i].title);

			failureMsg += (failureMsg ? ("\n\n") : "") + formatMessage(messages[FAILURE_MSG_ADDITIONAL_APPS_NOT_VISIBLE], failures.join(', '));
		}

		notVisibleAssertionPassed = false;
		return failureMsg;
	}

	function convertAppIdsToTitles(appIdArr, isVisibleAssertType) {
		var titleArr = isVisibleAssertType ? step.inputs.visible_application_titles : step.inputs.not_visible_application_titles;
		if (!titleArr)
			return appIdArr.join(', ');

		var appTitles = [];
		for (var i = 0; i < appIdArr.length; i += 1)
			appTitles.push(titleArr[appIdArr[i]]);

		return appTitles.join(', ');
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
