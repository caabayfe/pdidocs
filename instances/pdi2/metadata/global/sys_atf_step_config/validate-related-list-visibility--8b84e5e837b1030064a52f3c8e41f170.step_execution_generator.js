(function executeStep(step, stepResult) {
	var MESSAGE_KEY_CHECKING_RL_VISIBILITY = "Checking related list visibility on the form";
	var MESSAGE_NO_G_FORM = "FAILURE: A valid form must be opened in order to check for related list visibility"
	var RL_VISIBLE_SUCCESS_MSG = "Successfully validated that the following related lists were visible on the '{0}' form: {1}";
	var RL_NOT_VISIBLE_SUCCESS_MSG = "Successfully validated that the following related lists were not visible on the '{0}' form: {1}";
	var RL_VISIBLE_FAIL_MSG = "FAILURE: Expected the following related lists to be visible on the '{0}' form but they were not visible: {1}";
	var RL_NOT_VISIBLE_FAIL_MSG = "FAILURE: Expected the following related lists to not be visible on the '{0}' form but they were visible: {1}";
	var WS_NOT_SUPPORTED = "FAILURE: Only Standard UI forms are supported for related list visibility step";
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_CHECKING_RL_VISIBILITY, MESSAGE_NO_G_FORM, RL_VISIBLE_SUCCESS_MSG,
		RL_NOT_VISIBLE_SUCCESS_MSG, RL_VISIBLE_FAIL_MSG, RL_NOT_VISIBLE_FAIL_MSG, WS_NOT_SUPPORTED]);
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_CHECKING_RL_VISIBILITY]);

	// Before anything else make sure a valid form is open
	var frameWindow = g_ui_testing_util.getTestIFrameWindow();
	if (!frameWindow.g_form) {
		stepResult.success = false;
		stepResult.message = messageMap[MESSAGE_NO_G_FORM];
		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		step.defer.reject();
	}

	var visibleListsToValidate = step.inputs.visible ? step.inputs.visible.split(',') : [];
	var notVisibleListsToValidate = step.inputs.not_visible ? step.inputs.not_visible.split(',') : [];
	var visibleListLabelsToValidate = [];
	var notVisibleListLabelsToValidate = [];
	getRelatedListLabels(step.inputs.table, step.inputs.visible, true)
	.then(function() { return getRelatedListLabels(step.inputs.table, step.inputs.not_visible, false) })
	.then(ATFListHelper.getGlideLists2)
	.then(checkRelatedListVisibility)
	['catch'](function(ex) {
		stepResult.success = false;
		if (ex)
			ex = ex.toString();
		stepResult.message = ex;

		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		step.defer.reject();
	});

	function checkRelatedListVisibility(gLists2) {
		// GlideLists2 can be undefined even when on a form if no related lists are configured for that form
		// In that case default to an empty object (i.e., all lists are not visible)
		if (!gLists2)
			gLists2 = {};

		var resultMessage = "";
		if (!frameWindow || !frameWindow.g_form) {
			// Step can't run, is this a WS page or not?
			if (frameWindow && frameWindow.ux_globals && frameWindow.ux_globals.siteName) {
				// Is WS - use workspace not supported message
				resultMessage += formatMessage(messageMap[WS_NOT_SUPPORTED]);
			} else {
				// Is not WS - use standard no form message
				resultMessage += formatMessage(messageMap[MESSAGE_NO_G_FORM]);
			}
			g_ui_testing_util.setTestStepStatusMessage(resultMessage);
			stepResult.message = resultMessage;
			stepResult.success = false;
			step.defer.reject();
			return;
		}

		var currentFormTable = frameWindow.g_form.getTableName();
		var visibleListFailures = [];
		var listName;
		var i;
		for (i = 0; i < visibleListsToValidate.length; i += 1) {
			listName = currentFormTable + '.' + visibleListsToValidate[i];
			if (!ATFListHelper.isListVisible(gLists2[listName]))
				visibleListFailures.push(visibleListLabelsToValidate[i]);
		}

		var notVisibleListFailures = [];
		for (i = 0; i < notVisibleListsToValidate.length; i += 1) {
			listName = currentFormTable + '.' + notVisibleListsToValidate[i];
			if (ATFListHelper.isListVisible(gLists2[listName]))
				notVisibleListFailures.push(notVisibleListLabelsToValidate[i]);
		}

		if (visibleListLabelsToValidate.length > 0) {
			if (visibleListFailures.length > 0)
				resultMessage += formatMessage(messageMap[RL_VISIBLE_FAIL_MSG], step.inputs.table, visibleListFailures.join(', '));
			else if (notVisibleListFailures.length == 0)
				resultMessage += formatMessage(messageMap[RL_VISIBLE_SUCCESS_MSG], step.inputs.table, visibleListLabelsToValidate.join(', '));
		}

		if (notVisibleListLabelsToValidate.length > 0) {
			if (notVisibleListFailures.length > 0)
				resultMessage += (resultMessage ? ("\n\n") : "") + formatMessage(messageMap[RL_NOT_VISIBLE_FAIL_MSG], step.inputs.table, notVisibleListFailures.join(', '));
			else if (visibleListFailures.length == 0)
				resultMessage += (resultMessage ? ("\n\n") : "") + formatMessage(messageMap[RL_NOT_VISIBLE_SUCCESS_MSG], step.inputs.table, notVisibleListLabelsToValidate.join(', '));
		}

		g_ui_testing_util.setTestStepStatusMessage(resultMessage);
		stepResult.message = resultMessage;
		stepResult.success = visibleListFailures.length == 0 && notVisibleListFailures.length == 0;
		if (stepResult.success)
			step.defer.resolve();
		else
			step.defer.reject();
	}

	function getRelatedListLabels(tableName, relatedListNames, isVisibleVar) {
		var defer = g_ui_testing_util.q().defer();
		var ga = new GlideAjax('ATFRelatedListUtil');
		ga.addParam('sysparm_name', 'getRelatedListLabels');
		ga.addParam('sysparm_table', tableName);
		ga.addParam('sysparm_related_list_names', relatedListNames);
		if (!relatedListNames)
			defer.resolve();
		else
			ga.getXMLAnswer(function(relatedListLabels) {
				if (relatedListLabels) {
					var labelArr = relatedListLabels.split(',');
					if (isVisibleVar)
						visibleListLabelsToValidate = labelArr;
					else
						notVisibleListLabelsToValidate = labelArr;
				}

				defer.resolve();
		});

		return defer.promise;
	}
}(step, stepResult));
