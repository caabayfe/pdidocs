(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
    var alh = new ATFListHelper(step.inputs);
	var isRelatedList = alh.isRelatedList();
	var CLICKING_LIST_UI_ACTION = "Clicking list UI action '{0}'";
	var FAILURE_ACTION_DOES_NOT_EXIST = "FAILURE: UI action with id '{0}' does not exist";
	var FAILURE_CONTEXT_MENU_REQUIRES_RECORD = "FAILURE: A context menu UI action must have a record specified";

	var FAILURE_COULD_NOT_FIND_ACTION = isRelatedList ?
		"FAILURE: Unable to find {0} UI action '{1}' in the '{2}' related list on the '{3}' form" :
		"FAILURE: Unable to find {0} UI action '{1}' in the '{2}' list";
	var SUCCESS_CLICKED_LIST_ACTION = isRelatedList ?
		"Successfully clicked the {0} UI action '{1}' in the '{2}' related list on the '{3}' form" :
		"Successfully clicked the {0} UI action '{1}' in the '{2}' list";
	var SUCCESS_RELOAD_REDIRECT = isRelatedList ?
		"Successfully clicked the {0} UI action '{1}' in the '{2}' related list on the '{3}' form and verified the page reloads or redirects" :
		"Successfully clicked the {0} UI action '{1}' in the '{2}' list and verified the page reloads or redirects";
	var FAILURE_NO_RECORDS = isRelatedList ?
		"FAILURE: Unable to click {0} UI action '{1}'. There are no records in the '{2}' related list on the '{3}' form" :
		"FAILURE: Unable to click {0} UI action '{1}'. There are no records in the '{2}' list";
	var FAILURE_RECORD_NOT_FOUND = isRelatedList ?
		"FAILURE: Unable to click {0} UI action '{1}' in the '{2}' related list on the '{3}' form. Record '{4}' not found in list" :
		"FAILURE: Unable to click {0} UI action '{1}' in the '{2}' list. Record '{4}' not found in list";
	var FAILURE_RELOAD_REDIRECT = isRelatedList ?
		"FAILURE: Page is not reloaded or redirected when clicking {0} UI Action '{1}' in the '{2}' related list on the '{3}' form" :
		"FAILURE: Page is not reloaded or redirected when clicking {0} UI Action '{1}' in the '{2}' list";
	var FAILURE_UI_ACTION_DISABLED = isRelatedList ?
		"FAILURE: The {0} UI Action '{1}' is disabled in the '{2}' related list on the '{3}' form" :
		"FAILURE: The {0} UI Action '{1}' is disabled in the '{2}' list";
	var messageMap = new GwtMessage().getMessages([CLICKING_LIST_UI_ACTION, FAILURE_ACTION_DOES_NOT_EXIST, FAILURE_COULD_NOT_FIND_ACTION, SUCCESS_CLICKED_LIST_ACTION,
		SUCCESS_RELOAD_REDIRECT, FAILURE_NO_RECORDS, FAILURE_CONTEXT_MENU_REQUIRES_RECORD, FAILURE_RECORD_NOT_FOUND, FAILURE_RELOAD_REDIRECT, FAILURE_UI_ACTION_DISABLED]);

	var frameWindow = g_ui_testing_util.getTestIFrameWindow();
	var uiActionSysId = step.inputs.list_action;
	var actionType = step.inputs.action_type;
	var applyTo = step.inputs.apply_to;
	var recordId = step.inputs.record_id;
	var assertType = step.inputs.assert_type;

	if (!step.inputs.ui_action || !uiActionSysId) {
		failStep(formatMessage(messageMap[FAILURE_ACTION_DOES_NOT_EXIST], uiActionSysId));
		return;
	}

	var uiActionName = step.inputs.ui_action.name;
	var actionTypeLabel = step.inputs.action_type_label;
	var listLabel = step.inputs.list_label;
	var recordLabel = step.inputs.record_label;
	var listId = alh.getListID();

	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[CLICKING_LIST_UI_ACTION], uiActionName));

	alh.getListObject()
		.then(clickCheckbox)
		.then(clickUIAction)
		['catch'](function(ex) {
			failStep(alh.getExceptionMessage(ex));
		});

	function clickCheckbox(gList) {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();

		if (applyTo === 'single_record') {
			if (recordId) {
				alh.applyFilter(gList, 'sys_id=' + recordId + '^EQ')
					.then(function (gList) {
						var checkboxElem = frameWindow.gel('check_container_' + listId + '_' + recordId);
						if (checkboxElem)
							checkboxElem.click();

						deferred.resolve(gList);
					});
			} else
				deferred.resolve(gList);
		} else if (applyTo === 'all_records') {
			// click all checkboxes
			var allCheckboxesElem = frameWindow.gel('allcheck_' + listId);
			if (allCheckboxesElem)
				allCheckboxesElem.click();

			deferred.resolve(gList);
		} else
			deferred.resolve(gList);

		return deferred.promise;
	}

	function clickUIAction(gList) {
		var listContainer = gList.listContainer;
		if (!listContainer) {
			console.log("No valid list container");
			failStep(addMessageContext(FAILURE_COULD_NOT_FIND_ACTION));
			return;
		}

		// need at least one record in the list to click a choice or bottom button
		if (actionType === 'list_choice' || actionType === 'list_bottom_button') {
			if (gList.totalRows === 0) {
				failStep(addMessageContext(FAILURE_NO_RECORDS));
				return;
			}
		}

		if (actionType === 'list_choice')
			clickListChoice(listContainer);
		else if (actionType === 'list_context_menu')
			clickContextMenu();
		else {
			var uiActionElem = findUIActionByType(listContainer, uiActionSysId, actionType);
			if (!uiActionElem) {
				failStep(addMessageContext(FAILURE_COULD_NOT_FIND_ACTION));
				return;
			}

			uiActionElem.click();
			checkAssertType();
		}
	}

	function clickListChoice(listContainer) {
		var optionElem = findUIActionByType(listContainer, uiActionSysId, actionType);
		if (!optionElem) {
			failStep(addMessageContext(FAILURE_COULD_NOT_FIND_ACTION));
			return;
		}

		// send a mousedown event to the select, which triggers the AJAXActionSecurity call
		var selectElem = optionElem.parentNode;
		var mde = frameWindow.document.createEvent('MouseEvents');
		mde.initEvent('mousedown', true, false);
		selectElem.dispatchEvent(mde);

		// set value of the select to the option value
		selectElem.value = optionElem.value;

		// check if the option is disabled
		if (optionElem.hasAttribute('disabled')) {
			failStep(addMessageContext(FAILURE_UI_ACTION_DISABLED));
			return;
		}

		// send a change event to the select, so the action actually runs
		var ce = frameWindow.document.createEvent('Event');
		ce.initEvent('change', true, false);
		selectElem.dispatchEvent(ce);
		checkAssertType();
	}

	function clickContextMenu() {
		if (!recordId) {
			failStep(formatMessage(messageMap[FAILURE_CONTEXT_MENU_REQUIRES_RECORD]));
			return;
		}

		var recordNotFoundMsg = isRelatedList ? formatMessage(messageMap[FAILURE_RECORD_NOT_FOUND], actionTypeLabel, uiActionName, listLabel, step.inputs.table, recordLabel) :
			formatMessage(messageMap[FAILURE_RECORD_NOT_FOUND], actionTypeLabel, uiActionName, listLabel, recordLabel);
		var specifiedRecordElem = frameWindow.gel('row_' + listId + '_' + recordId);
		if (!specifiedRecordElem) {
			failStep(recordNotFoundMsg);
			return;
		}

		var cellsToRightClick = specifiedRecordElem.getElementsByClassName('vt');
		if (cellsToRightClick.length == 0) {
			console.log('Could not find a cell to right click in the related list');
			failStep(recordNotFoundMsg);
			return;
		}

		g_ui_testing_util.rightClickElement(cellsToRightClick[0]);

		var contextMenu = frameWindow.contextMenus['context_list_row' + listId];
		var contextMenuChildren;
		if (!contextMenu || !contextMenu.children) {
			console.log("Context menu object not found");
			contextMenuChildren = [];
		} else
			contextMenuChildren = contextMenu.children;

		var contextMenuElem;
		for (var i = 0; i < contextMenuChildren.length; i += 1) {
			var child = contextMenuChildren[i];
			if (!child || typeof child.getAttribute !== "function")
				continue;

			if (child.getAttribute("item_id") === uiActionSysId) {
				contextMenuElem = child;
				break;
			}
		}

		if (!contextMenuElem)
			failStep(addMessageContext(FAILURE_COULD_NOT_FIND_ACTION));
		else {
			contextMenuElem.click();
			checkAssertType();
		}
	}

	/**
	 * Searches for the UI Action by type inside the list container because there can be id collisions if the same UI action is on more than one related list
	 */
	function findUIActionByType(listContainer, id, actionType) {
		var expectedTagName;
		if (actionType === 'list_banner_button' || actionType === 'list_bottom_button')
			expectedTagName = 'button';
		else if (actionType === 'list_link')
			expectedTagName = 'a';
		else if (actionType === 'list_choice')
			expectedTagName = 'option';

		if (!expectedTagName) {
			console.log("Unknown action type: " + actionType);
			return null;
		}

		var idQueryString = expectedTagName + "[id='" + uiActionSysId + "']";
		var uiActionElem = listContainer.querySelector(idQueryString);
		if (!uiActionElem) {
			// for some types of UI actions with action names, the id is the action name and the gsft_id attribute is the sys_id
			var gsftIdQueryString = expectedTagName + "[gsft_id='" + uiActionSysId + "']";
			uiActionElem = listContainer.querySelector(gsftIdQueryString);
			if (!uiActionElem) {
				console.log("Failed to find list UI action of type '" + actionType + "' using query selectors: " + idQueryString + " and " + gsftIdQueryString);
				return null;
			}
		}

		return uiActionElem;
	}

	function checkAssertType() {
		if (assertType === 'page_reloaded_or_redirected')
			g_ui_testing_util.waitForPageReload(step.timeout, waitCallback);
		else
			passStep(addMessageContext(SUCCESS_CLICKED_LIST_ACTION));
	}

	function waitCallback(wasReloaded) {
		if (wasReloaded)
			passStep(addMessageContext(SUCCESS_RELOAD_REDIRECT));
		else
			failStep(addMessageContext(FAILURE_RELOAD_REDIRECT));
	}

	function passStep(msg) {
		stepResult.success = true;
		stepResult.message = msg;
		g_ui_testing_util.setTestStepStatusMessage(msg);
		step.defer.resolve();
	}

	function failStep(msg) {
		stepResult.success = false;
		stepResult.message = msg;
		g_ui_testing_util.setTestStepStatusMessage(msg);
		step.defer.reject();
	}

	function addMessageContext(msg) {
		// Format the step result message with appropriate values depending on the context
		if (isRelatedList)
			return formatMessage(messageMap[msg], actionTypeLabel, uiActionName, listLabel, step.inputs.table);

		return formatMessage(messageMap[msg], actionTypeLabel, uiActionName, listLabel);
	}

	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
