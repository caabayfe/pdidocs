(function executeStep(step, stepResult) {
	var alh = new ATFListHelper(step.inputs);
	var isRelatedList = alh.isRelatedList();
	var listId = alh.getListID();

	var VALIDATING_LIST_UI_ACTION_VISIBILITY = "Validating List UI action visibility";
	var PROVIDE_AT_LEAST_ONE = "LIST_Provide at least one UI action to assert as visible or not visible";
	var NO_LIST_FOUND = isRelatedList ?
		"FAILURE: Unable to find related list '{0}' on the '{1}' form":
		"FAILURE: Unable to find list '{0}'";
	var SUCCESS_VISIBLE = isRelatedList ?
		"Successfully validated that UI action '{0}' is visible on the '{1}' related list on the '{2}' form":
		"Successfully validated that UI action '{0}' is visible on the '{1}' list";
	var FAILURE_NOT_VISIBLE = isRelatedList ?
		"FAILURE: UI action '{0}' is not visible on the '{1}' related list on the '{2}' form":
		"FAILURE: UI action '{0}' is not visible on the '{1}' list";
	var SUCCESS_NOT_VISIBLE = isRelatedList ? 
		"Successfully validated that UI action '{0}' is not visible on the '{1}' related list on the '{2}' form":
		"Successfully validated that UI action '{0}' is not visible on the '{1}' list";
	var FAILURE_VISIBLE = isRelatedList ?
		"FAILURE: UI action '{0}' is visible on the '{1}' related list on the '{2}' form":
		"FAILURE: UI action '{0}' is visible on the '{1}' list";

	var messageMap = new GwtMessage().getMessages([VALIDATING_LIST_UI_ACTION_VISIBILITY, PROVIDE_AT_LEAST_ONE,
		NO_LIST_FOUND, SUCCESS_VISIBLE, FAILURE_NOT_VISIBLE, SUCCESS_NOT_VISIBLE, FAILURE_VISIBLE]);

	g_ui_testing_util.setTestStepStatusMessage(messageMap[VALIDATING_LIST_UI_ACTION_VISIBILITY]);

	var listLabel = step.inputs.list_label;
	var uiActionFieldValuesMap = step.inputs.ui_action_field_values_map;

	var frameWindow = g_ui_testing_util.getTestIFrameWindow();

	var tableName = step.inputs.table;

	if (!step.inputs.visible && !step.inputs.not_visible) {
		passStep(messageMap[PROVIDE_AT_LEAST_ONE]);
		return;
	}

	alh.getListObject()
		.then(checkUIActionVisibility)
		['catch'](function(ex) {
			failStep(alh.getExceptionMessage(ex));
		});

	function checkUIActionVisibility(gList) {
		var message = "";
		var i;
		var failed;

		// search inside the list container because there can be id collisions
		// if the same UI action shows up on more than one related list
		var listContainer = gList.listContainer;
		if (!listContainer) {
			if (isRelatedList)
				failStep(formatMessage(messageMap[NO_LIST_FOUND], listLabel, tableName));
			else
				failStep(formatMessage(messageMap[NO_LIST_FOUND], listLabel));

			return;
		}

		if (step.inputs.visible) {
			var visibleActionIds = step.inputs.visible.split(",");
			for (i = 0; i < visibleActionIds.length; i++) {
				var visibleActionLabel = uiActionFieldValuesMap[visibleActionIds[i]].label.trim();
				var visibleCheckMsg;
				if (checkVisibility(gList, visibleActionIds[i], step.inputs.related_list)) {
					visibleCheckMsg = isRelatedList ?
						formatMessage(messageMap[SUCCESS_VISIBLE], visibleActionLabel, listLabel, tableName) :
						formatMessage(messageMap[SUCCESS_VISIBLE], visibleActionLabel, listLabel);
				} else {
					visibleCheckMsg = isRelatedList ?
						formatMessage(messageMap[FAILURE_NOT_VISIBLE], visibleActionLabel, listLabel, tableName) :
						formatMessage(messageMap[FAILURE_NOT_VISIBLE], visibleActionLabel, listLabel);
					failed = true;
				}

				message += (message ? ("\n") : "") + visibleCheckMsg;
			}
		}

		if (step.inputs.not_visible) {
			var notVisibleActionIds = step.inputs.not_visible.split(",");
			for (i = 0; i < notVisibleActionIds.length; i++) {
				var notVisibleActionLabel = uiActionFieldValuesMap[notVisibleActionIds[i]].label.trim();
				var notVisibleCheckMsg;
				if (!checkVisibility(gList, notVisibleActionIds[i], step.inputs.related_list)) {
					notVisibleCheckMsg = isRelatedList ?
						formatMessage(messageMap[SUCCESS_NOT_VISIBLE], notVisibleActionLabel, listLabel, tableName) :
						formatMessage(messageMap[SUCCESS_NOT_VISIBLE], notVisibleActionLabel, listLabel);
				} else {
					notVisibleCheckMsg = isRelatedList ?
						formatMessage(messageMap[FAILURE_VISIBLE], notVisibleActionLabel, listLabel, tableName) :
						formatMessage(messageMap[FAILURE_VISIBLE], notVisibleActionLabel, listLabel);
					failed = true;
				}

				message += (message ? ("\n") : "") + notVisibleCheckMsg;
			}
		}

		if (!failed) {
			passStep(message);
			return;
		}

		failStep(message);
	}

	function checkVisibility(gList, actionId, relatedList) {
		var uiActionFieldValues = uiActionFieldValuesMap[actionId];
		if (uiActionFieldValues.active == "false")
			return false;

		// if the list is empty, list bottom UI Action buttons, list choice UI Actions, and list context menu UI Actions are hidden so return false
		if (isListEmpty(gList) && actionIsHiddenWhenListEmpty(uiActionFieldValues))
			return false;

		// for UI actions that are only context menu actions right click a cell in the first row
		if (isOnlyContextMenuAction(uiActionFieldValues)) {
			var firstRecordId = gList._getRecords()[0].sys_id;
			var firstRecordElem = gList.getRow(firstRecordId);
			if (!firstRecordElem) {
				console.log(formatMessage("Unable to find first record on the '{0}' list", listLabel));
				return false;
			}

			var cellsToRightClick = firstRecordElem.getElementsByClassName("vt");
			if (cellsToRightClick.length == 0) {
				console.log(formatMessage("Unable to find a cell to right click on the '{0}' list", listLabel));
				return false;
			}

			// right click record and loop through the context menu UI actions
			g_ui_testing_util.rightClickElement(cellsToRightClick[0]);
			var contextMenuName = 'context_list_row' + listId;
			var contextMenu = frameWindow.contextMenus[contextMenuName];
			var contextMenuChildren = contextMenu.children;
			for (var i = 0; i < contextMenuChildren.length; i += 1) {
				var child = contextMenuChildren[i];
				if (child.getAttribute('item_id') === actionId)
					return true;
			}

			return false;
		}

		// use gsft_id for banner buttons, bottom buttons, and related links
		// use ids for list choice actions
		var queryString;
		if (uiActionFieldValues.list_banner_button == "true" || uiActionFieldValues.list_button == "true" || uiActionFieldValues.list_link == "true")
			queryString = "[gsft_id='" + actionId + "']";
		else
			queryString = "[id='" + actionId + "']";

		var listContainerElement = gList.listContainer;
		var uiActionElement = listContainerElement.querySelector(queryString);
		if (!uiActionElement)
			return false;

		return isVisible(uiActionElement);
	}

	function isListEmpty(gList) {
		return gList.totalRows === 0;
	}

	// list context menu, list choice, and list bottom buttons are hidden when the list is empty
	// returns true if UI action is hidden when list is empty
	function actionIsHiddenWhenListEmpty(uiActionFieldValues) {
		return (uiActionFieldValues.list_context_menu == "true" || uiActionFieldValues.list_choice == "true" || uiActionFieldValues.list_button == "true") && (uiActionFieldValues.list_banner_button == "false" && uiActionFieldValues.list_link == "false");
	}

	// returns true if UI action is only a context menu action
	function isOnlyContextMenuAction(uiActionFieldValues) {
		return (uiActionFieldValues.list_banner_button == "false" && uiActionFieldValues.list_button == "false" && uiActionFieldValues.list_context_menu == "true" && uiActionFieldValues.list_choice == "false" && uiActionFieldValues.list_link == "false");
	}

	function isVisible(dom) {
		return !dom.hidden && dom.style.visibility != 'hidden';
	}

	function passStep(msg) {
		stepResult.success = true;
		stepResult.message = msg;
		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		step.defer.resolve();
	}

	function failStep(msg) {
		stepResult.success = false;
		stepResult.message = msg;
		g_ui_testing_util.setTestStepStatusMessage(msg);
		step.defer.reject();
	}

}(step, stepResult));
