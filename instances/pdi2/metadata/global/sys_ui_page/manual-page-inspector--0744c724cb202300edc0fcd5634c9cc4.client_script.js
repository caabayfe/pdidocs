(function() {
	'use strict';

	// Standard UI section state tracker
	var standardUIState = { lastRecordSelectTable: null, isValidTable: false, tableName: null };

	/* Constants */

	// for translation
	var gwtMessage = { getMessages: function(messages) { return messages; } };
	if (GwtMessage)
		gwtMessage = new GwtMessage();

	// translated messages
	var MESSAGE_KEY_STARTING_PAGE = 'ATF_CUSTOM_UI:Starting page';
	var MESSAGE_KEY_ID_TEMPLATE = 'ATF_CUSTOM_UI:ID: {0}';
	var MESSAGE_KEY_NAME_TEMPLATE = 'ATF_CUSTOM_UI:Name: {0}';
	var MESSAGE_KEY_PAGE_TITLE = 'ATF_CUSTOM_UI:Manual Page Inspector | ServiceNow';
	var MESSAGE_KEY_SELECT_PAGE_TYPE = 'ATF_CUSTOM_UI:Select a page type';
	var MESSAGE_KEY_SELECT_WORKSPACE = 'ATF_CUSTOM_UI:Select a workspace';
	var MESSAGE_KEY_SELECT_TABLE = 'ATF_CUSTOM_UI:Select a table';
	var MESSAGE_KEY_NONE = '-- None --';
	var messageMap = gwtMessage.getMessages([
		MESSAGE_KEY_STARTING_PAGE, MESSAGE_KEY_ID_TEMPLATE, MESSAGE_KEY_NAME_TEMPLATE, MESSAGE_KEY_PAGE_TITLE,
		MESSAGE_KEY_SELECT_PAGE_TYPE, MESSAGE_KEY_SELECT_WORKSPACE, MESSAGE_KEY_SELECT_TABLE, MESSAGE_KEY_NONE
	]);

	// Page types, also used for the correspondig form section id
	var PAGE_TYPES = {
		SERVICE_PORTAL: 'service_portal',
		STANDARD_UI: 'standard_ui',
		UI_PAGES: 'ui_pages',
		WORKSPACE: 'workspace',
		CUSTOM: 'custom'
	};

	// HTML selectors
	var CUSTOM_URL_INPUT_ID = 'custom-start-page-url';
	var LAUNCH_INSPECTOR_BUTTON_ID = 'launch-atf-inspector';
	var RECORD_SELECT_ID = 'record-select-section';
	var WORKSPACE_RECORD_SECTION_ID = 'workspace-record-section';
	var SELECT_IDS = {
		PAGE_TYPE: 'page-type',
		UI_PAGE: 'inspector-start-ui-page',
		STANDARD_UI_PAGE: 'standard-ui-start-page',
		WORKSPACE: 'inspector-workspace',
		WORKSPACE_TABLE: 'inspector-workspace-table',
		SP_PORTAL: 'portal',
		SP_PAGE: 'starting-page-title',
		STANDARD_UI_RECORD: 'table-record',
		WORKSPACE_RECORD: 'workspace-record'
	};

	// Initialize the page once the document loads
	window.addEventListener('load', init);

	/* Initialize the Page */

	/**
	 * Set up the form inputs with data and event listeners
	 */
	function init() {
		document.title = messageMap[MESSAGE_KEY_PAGE_TITLE];

		initSharedInputs();
		initWorkspaceSelect2();
		initServicePortalSelect2();
		initUIPagesSelect2();
		initStandardUISelect2();
		initCustom();

		// hide all of the sections when the page first loads
		pageTypeChanged();
	}

	/**
	 * Initialize the page type select and the "Inspect" button
	 */
	function initSharedInputs() {
		var element = document.getElementById(SELECT_IDS.PAGE_TYPE);
		_getSelect2(element, messageMap[MESSAGE_KEY_SELECT_PAGE_TYPE]);
		$j(element).on('change', pageTypeChanged);

		// disable the inspect button when the page first loads
		disableInspectButton(true);
		$j('#' + LAUNCH_INSPECTOR_BUTTON_ID).on('click', openATFInspector);
	}

	/**
	 * Initialize the Workspace selects
	 */
	function initWorkspaceSelect2() {
		var select = document.getElementById(SELECT_IDS.WORKSPACE);
		_getSelect2(select, messageMap[MESSAGE_KEY_SELECT_WORKSPACE]);
		$j(select).on('change', setInspectButtonState);

		select = document.getElementById(SELECT_IDS.WORKSPACE_TABLE);
		_getSelect2(select, messageMap[MESSAGE_KEY_SELECT_TABLE], null, resultFormatter);
		$j(select).on('change', function(e) {
			setInspectButtonState();
			setRecordTableOptions(SELECT_IDS.WORKSPACE_RECORD, e.target.value);
		});

		function resultFormatter(data) {
			return !data.id ? data.text :
				$j("<span>" + data.text + "<div>" + formatMessage(messageMap[MESSAGE_KEY_NAME_TEMPLATE], data.id) + "</div></span>");
		}
	}

	/**
	 * Initialize the UI Page section select
	 */
	function initUIPagesSelect2() {
		var element = document.getElementById(SELECT_IDS.UI_PAGE);
		var UI_PAGE_API_URL = 'api/now/page_inspector/manual_page_inspector/ui_page_names';
		_getSelect2(element, messageMap[MESSAGE_KEY_SELECT_PAGE_TYPE], UI_PAGE_API_URL, formatPageResult);
		$j(element).on('change', setInspectButtonState);

		function formatPageResult(data) {
			if (!data.id)
				return data.text;

			return $j('<span>' + data.text + '</span>');
		}
	}

	/**
	 * Initialize the Standard UI section select
	 */
	function initStandardUISelect2() {
		var standardUISelect = document.getElementById(SELECT_IDS.STANDARD_UI_PAGE);
		var GUIDED_TOURS_UI_API = "api/now/guided_tours/platform/page_name";
		_getSelect2(standardUISelect, messageMap[MESSAGE_KEY_STARTING_PAGE], GUIDED_TOURS_UI_API, resultFormatter);
		$j(standardUISelect).on('change', setInspectButtonState);

		function resultFormatter(data) {
			return !data.id ? data.text :
				$j("<span>" + data.text + "<div>" + formatMessage(messageMap[MESSAGE_KEY_NAME_TEMPLATE], data.id) + "</div></span>");
		}
	}

	/**
	 * Initialize the portal and portal page selects for the service portal page type
	 */
	function initServicePortalSelect2() {
		var ga = new GlideAjax('AJAXManualPageInspector');
		ga.addParam('sysparm_name', 'getAppPageNames');
		ga.getXML(handleAjaxResponse);

		function handleAjaxResponse(response) {
			if (!response)
				return;

			var i = 0;
			var portal = document.getElementById(SELECT_IDS.SP_PORTAL);
			var portalPageSelect = document.getElementById(SELECT_IDS.SP_PAGE);
			var list = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
			if (list && list.portalPages && list.portalPages.length ) {
				for (i = 0; i < list.portalPages.length; i++)
					addOptionToSelect(portalPageSelect, list.portalPages[i].title, list.portalPages[i].id);

				for (i = 0; i < list.portals.length; i++)
					addOptionToSelect(portal, list.portals[i].title, list.portals[i].url_suffix);
			}

			// only init the select2 after all of the options have been added
			_getSelect2(portalPageSelect, '', null, formatSPPageResult, null, spMatcher);
			_getSelect2(portal, '', null, null, null, spMatcher);

			$j(portalPageSelect).on('change', setInspectButtonState);
			$j(portal).on('change', setInspectButtonState);

			// Helper functions for the SP select2s
			function formatSPPageResult(data) {
				if (!data.id)
					return data.text;

				return $j('<span>' + data.text + '<div>' +
					formatMessage(messageMap[MESSAGE_KEY_ID_TEMPLATE], data.id) + '</div></span>');
			}

			function spMatcher(term, text, option) {
				return text.toUpperCase().indexOf(term.toUpperCase()) >= 0 ||
					option.val().toUpperCase().indexOf(term.toUpperCase()) >= 0;
			}

			function addOptionToSelect(select, text, value) {
				var option = document.createElement('option');
				option.text = text;
				option.setAttribute('value', value);
				select.add(option);
			}
		}
	}

	/**
	 * Initialize the event listener for the custom URL section
	 */
	function initCustom() {
		$j('#' + CUSTOM_URL_INPUT_ID).on('keyup', setInspectButtonState);
	}

	/* Select2 helpers */

	/**
	 * A convenience function for setting up a select2 with a variety of optional methods
	 * @param element {HTMLElement} The select element to init a select2 on
	 * @param placeholder {string} The placeholder string for the select2
	 * @param dataUrl {string=} The dataUrl if we want to delegate the datasource to the select2
	 * @param resultFormatter {function=} A function to handle formatting the result of the ajax call
	 * @param resultHandler {function=} A function to handle the result of the ajax call
	 * @param matcherFn {function=} A function to use to match options when a user types
	 * @param selectionFormatter {function=} A function to format the current selected option
	 * @private
	 */
	function _getSelect2(element, placeholder, dataUrl, resultFormatter, resultHandler, matcherFn, selectionFormatter) {
		var ajax = undefined;
		if (dataUrl) {
			ajax = {
				url: dataUrl,
				dataType: 'json',
				quietMillis: 250,
				data: function(search, page) {
					return {
						sysparm_name: search,
						sysparm_limit: 20,
						sysparm_offset: ((page - 1) * 20) + ''
					};
				},
				results: resultHandler || defaultResultHandler
			}
		}

		$j(element).select2({
			placeholder: placeholder,
			ajax: ajax,
			formatResult: resultFormatter || defaultPageResultFormatter,
			formatSelection: selectionFormatter || formatPageSelection,
			matcher: matcherFn || defaultMatcher
		});

		// default select2 formatters and matchers - used if one is not passed as an argument
		function defaultPageResultFormatter(data) {
			return data.text;
		}

		// default handler for formatting AJAX responses into an object
		function defaultResultHandler(response, page) {
			if (!response || !response.result || !response.result.data)
				return;

			var more = (page * 20) < response.result.totalRecords;
			return {
				results: response.result.data.map(function(d) {
					return {
						id: d.name,
						text: d.label
					};
				}),
				more: more
			};
		}

		// default handler for formatting each option
		function formatPageSelection(data) {
			if (!data.id)
				return $j('<span>' + data.text + '</span>');

			return $j('<span id="' + data.id + '">' + data.text + '</span>');
		}

		// default search method
		function defaultMatcher(term, text) {
			return text.toLowerCase().indexOf(term.toLowerCase()) >= 0;
		}
	}

	/* Page Business logic */

	/**
	 * Find out which page type is currently selected and hide/show the appropriate form section
	 */
	function pageTypeChanged() {
		var pageType = getElementValue(SELECT_IDS.PAGE_TYPE);
		setRequiredLabelCompleteClass(SELECT_IDS.PAGE_TYPE);

		// show the appropriate section and hide the rest
		setVisibilityForElementByID('is-ui-pages', pageType === PAGE_TYPES.UI_PAGES);
		setVisibilityForElementByID('is-standard-ui', pageType === PAGE_TYPES.STANDARD_UI);
		setVisibilityForElementByID('is-sp', pageType === PAGE_TYPES.SERVICE_PORTAL);
		setVisibilityForElementByID('is-workspace', pageType === PAGE_TYPES.WORKSPACE);
		setVisibilityForElementByID('is-custom', pageType === PAGE_TYPES.CUSTOM);

		// we need to enable/disable the inspect button if the section is complete/empty
		setInspectButtonState();
	}

	/**
	 * Enable or disable the inspect button depending on the currently selected page type, and set required items complete.
	 */
	function setInspectButtonState() {
		var pageType = getElementValue(SELECT_IDS.PAGE_TYPE);
		var shouldDisable = true;
		switch (pageType) {
			case PAGE_TYPES.UI_PAGES:
				setRequiredLabelCompleteClass(SELECT_IDS.UI_PAGE);
				shouldDisable = !getElementValue(SELECT_IDS.UI_PAGE);
				break;
			case PAGE_TYPES.STANDARD_UI:
				setRequiredLabelCompleteClass(SELECT_IDS.STANDARD_UI_PAGE);

				// because we may need to preform an asynchronous API call, we will delegate enabling the button to this method
				shouldDisable = !getElementValue(SELECT_IDS.STANDARD_UI_PAGE);
				break;
			case PAGE_TYPES.SERVICE_PORTAL:
				setRequiredLabelCompleteClass(SELECT_IDS.SP_PORTAL);
				setRequiredLabelCompleteClass(SELECT_IDS.SP_PAGE);
				shouldDisable = !(getElementValue(SELECT_IDS.SP_PORTAL) && getElementValue(SELECT_IDS.SP_PAGE));
				break;
			case PAGE_TYPES.WORKSPACE:
				setRequiredLabelCompleteClass(SELECT_IDS.WORKSPACE);
				shouldDisable = !getElementValue(SELECT_IDS.WORKSPACE);
				break;
			case PAGE_TYPES.CUSTOM:
				setRequiredLabelCompleteClass(CUSTOM_URL_INPUT_ID);
				shouldDisable = !getElementValue(CUSTOM_URL_INPUT_ID);
				break;
		}

		disableInspectButton(shouldDisable);

		// Workspace and Standard UI sections have some extra work because you can display record pickers
		if (pageType === PAGE_TYPES.WORKSPACE)
			setVisibilityForElementByID(WORKSPACE_RECORD_SECTION_ID, !!getElementValue(SELECT_IDS.WORKSPACE_TABLE));
		else if (pageType === PAGE_TYPES.STANDARD_UI)
			displayAppropriateStandardUIInputs();
	}

	/**
	 * Check if the current Standard UI page is a table, and show the record select if it is
	 */
	function displayAppropriateStandardUIInputs() {
		var startPage = getElementValue(SELECT_IDS.STANDARD_UI_PAGE);

		// if the start page hasn't changed since we last called this function, just skip to validating
		// the other inputs
		if (startPage === standardUIState.tableName + '.do')
			showStandardUIInputs();
		else {
			// if the start page is a table, it will have .do appended to the table name, so remove it so that
			// we can validate the table name
			var tableName = startPage.replace('.do', '');
			validateTable(tableName, function completionCallback(isValidTable) {
				var lastVal = standardUIState.tableName + '.do';

				// if the last value was a valid table name, save that along with the other data
				if (standardUIState.isValidTable)
					standardUIState = { lastRecordSelectTable: lastVal, isValidTable: isValidTable, tableName: tableName };
				else {
					// otherwise only update that the current value is a valid table name with its value
					standardUIState.isValidTable = isValidTable;
					standardUIState.tableName = tableName;
				}

				showStandardUIInputs();
			});
		}

		/**
		 * Validate that a page name is a table name by calling the SN table api, which will return an error if we try an
		 * invalid table name
		 */
		function validateTable(tableName, completionCallback) {
			$j.ajax({
				method: 'GET',
				url: '/api/now/table/' + tableName + '?sysparm_limit=1',
				headers: { 'X-UserToken': window.g_ck }
			}).error(function onError() {
				completionCallback(false);
			}).done(function onComplete() {
				completionCallback(true);
			});
		}

		/**
		 * Show the record select and set its options to valid records for the current table
		 */
		function showStandardUIInputs() {
			// show the record select if the current standard ui page is a valid table
			setVisibilityForElementByID(RECORD_SELECT_ID, standardUIState.isValidTable);

			// show record picker for current table
			if (standardUIState.isValidTable)
				setRecordTableOptions(SELECT_IDS.STANDARD_UI_RECORD, standardUIState.tableName);
		}
	}

	/**
	 * Get the records for the given table name and populate a record
	 * @param id {string} the HTML id attribute for the select to populate with record data
	 * @param table {string} the table name to get records for
	 */
	function setRecordTableOptions(id, table) {
		var forWorkspaceRecordSelect = id === SELECT_IDS.WORKSPACE_RECORD;
		var tableSelectValue = getElementValue(SELECT_IDS.STANDARD_UI_PAGE);
		var recordSelect = document.getElementById(id);

		// if there's a value in the select, and the current table is the same as the last one, don't reload the select
		if (recordSelect.value !== '' && tableSelectValue === standardUIState.lastRecordSelectTable && !forWorkspaceRecordSelect)
			return;

		// clear the underlying select's options and the select2's value
		$j(recordSelect.querySelectorAll('option')).each(function(idx, el) { el.remove(); });
		recordSelect.value = '';
		$j(recordSelect).select2().val(null);

		var ga = new GlideAjax('AJAXManualPageInspector');
		ga.addParam('sysparm_name', 'getRecordsForTable');
		ga.addParam('sysparm_table', table);
		ga.getXML(handleResponse);

		function handleResponse(answer) {
			if (!answer)
				return;

			var data = JSON.parse(answer.responseXML.documentElement.getAttribute('answer'));
			if (data.length === 0)
				return;

			// add an HTML option element to the select for each record and a none element
			recordSelect.appendChild(getOption('', messageMap[MESSAGE_KEY_NONE]));
			for (var i = 0; i < data.length; i++) {
				var row = data[i];
				recordSelect.appendChild(getOption(row.id, row.name));
			}

			// get the select2 to pick up the changes
			_getSelect2(recordSelect, '', null, displayRecord);
		}

		/**
		 * Get an option for a select
		 * @param id {string}
		 * @param label {string}
		 */
		function getOption(id, label) {
			var option = document.createElement('option');
			option.innerText = label;
			option.setAttribute('value', id);
			option.setAttribute('id', id);
			return option;
		}

		/**
		 * Formatter for displaying records in the record picker
		 */
		function displayRecord(data) {
			if (!data.id || !data.element[0].id)
				return data.text;

			return $j('<span>' + data.text + '<div>' + formatMessage(messageMap[MESSAGE_KEY_ID_TEMPLATE], data.element[0].id) + '</div></span>');
		}
	}

	/**
	 * Open the inspector using the values specified in the form
	 * @param e {Event} The click event on the "Inspect" button
	 */
	function openATFInspector(e) {
		e.preventDefault();

		var pageType = getElementValue(SELECT_IDS.PAGE_TYPE);
		var url = window.location.protocol + '//' + window.location.host + '/nav_to.do?uri=$atf_page_inspector.do?sysparm_stack=no%26sysparm_url=';
		switch (pageType) {
			case PAGE_TYPES.UI_PAGES:
				url += getElementValue(SELECT_IDS.UI_PAGE);
				break;
			case PAGE_TYPES.STANDARD_UI:
				url += getStandardUIURL();
				break;
			case PAGE_TYPES.SERVICE_PORTAL:
				url += getElementValue(SELECT_IDS.SP_PORTAL) + "?id="+ getElementValue(SELECT_IDS.SP_PAGE);
				break;
			case PAGE_TYPES.WORKSPACE:
				url += getWorkspaceURL();
				break;
			case PAGE_TYPES.CUSTOM:
				url += getElementValue(CUSTOM_URL_INPUT_ID);
				break;
		}

		window.open(url);

		/**
		 * Get the URL for the standard ui page type
		 */
		function getStandardUIURL() {
			var url = getElementValue(SELECT_IDS.STANDARD_UI_PAGE);
			var recordID = getElementValue(SELECT_IDS.STANDARD_UI_RECORD);

			// if there's a record ID and the current starting page selection is a valid table, add the sys_id parameter to the URL
			if (recordID && standardUIState.isValidTable)
				url += '?sys_id=' + recordID;

			return url;
		}

		/**
		 * Get the URL for the workspace page type based on what inputs have been completed
		 * @returns {string}
		 */
		function getWorkspaceURL() {
			var url = 'now/workspace/' + getElementValue(SELECT_IDS.WORKSPACE);
			var table = getElementValue(SELECT_IDS.WORKSPACE_TABLE);
			var recordID = getElementValue(SELECT_IDS.WORKSPACE_RECORD);
			if (table) {
				if (recordID)
					url += "/record/" + table + "/" + recordID;
				else
					url += '/new_record/' + table;
			}

			return url;
		}
	}

	/* Utility methods for working with HTML/CSS */

	/**
	 * Set the visibility for an element
	 * @param targetID {string} HTML id for the element
	 * @param visible {boolean} true for visible, false for hidden
	 */
	function setVisibilityForElementByID(targetID, visible) {
		var HIDE_CLASS = 'hide';
		var element = document.getElementById(targetID);
		if (visible)
			element.classList.remove(HIDE_CLASS);
		else
			element.classList.add(HIDE_CLASS);
	}

	/**
	 * Set the is-filled class on required select labels so that the required symbol changes color as it does in platform forms
	 *
	 * Some select2's wipe out the id and name on the label for the original select, so we use the id of the original
	 * select and the data-label-name to lacate the label instead.
	 * @param selectID {string}
	 */
	function setRequiredLabelCompleteClass(selectID) {
		var label = document.querySelector('label[data-label-name=' + selectID + ']');
		if (!label)
			return;

		if (getElementValue(selectID))
			label.classList.add('is-filled');
		else
			label.classList.remove('is-filled');
	}

	/**
	 * Helper function to get the value for an element by its ID
	 * @param elementID {string}
	 * @returns {string}
	 */
	function getElementValue(elementID) {
		return document.getElementById(elementID).value.toString();
	}

	/**
	 * Disable or enable the "Inspect" button
	 * @param shouldDisable {boolean} true to disable, false to enable
	 */
	function disableInspectButton(shouldDisable) {
		if (shouldDisable) {
			document.getElementById(LAUNCH_INSPECTOR_BUTTON_ID).setAttribute('disabled', shouldDisable);
			document.getElementById(LAUNCH_INSPECTOR_BUTTON_ID).setAttribute('aria-disabled', shouldDisable);
		} else {
			document.getElementById(LAUNCH_INSPECTOR_BUTTON_ID).removeAttribute('disabled');
			document.getElementById(LAUNCH_INSPECTOR_BUTTON_ID).removeAttribute('aria-disabled');
		}
	}
}());
