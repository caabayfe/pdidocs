function onLoad() {
	// warning_message should be hidden but needs to be on the form so the client script can set the value
	g_form.setVisible("warning_message", false);

	var stepConfigWarnings = {
		// Set Field Values Step Config
		"fcae4a935332120028bc29cac2dc340e": ["check_table"],
		// Set Field Values (SP) Step Config
		"ba49e51de7420300b2888f49c2f6a93c": ["check_table"],
		// Record Insert Step Config
		"14872288df60220062fe6c7a4df26319": ["check_table"],
		// Record Update Step Config
		"17a72288df60220062fe6c7a4df26397": ["check_table", "check_record"],
		// Record Delete Step Config
		"8df72288df60220062fe6c7a4df2636d": ["check_table", "check_record"],
		// Record Validation Step Config
		"1f39a288df60220062fe6c7a4df2639d": ["check_table", "check_record", "usage_warning"],
		// Open an Existing Record Step Config
		"5f2e0e535332120028bc29cac2dc34d3": ["check_table", "check_record", "usage_warning"],
		// Open a Form (SP) Step Config
		"ca58a941e7020300b2888f49c2f6a95e": ["check_table", "check_sys_id", "usage_warning"],
		// Impersonate
		"071ee5b253331200040729cac2dc348d": ["check_user"],
		// Add Attachments to Existing Record
		"52c6cdb3b710330044026848ee11a91d": ["check_table", "check_record"],
		// Apply Filter (List)
		"a69843f2531332007e7829cac2dc34d7": ["check_table"]
	};

	var messageMap = new GwtMessage().getMessages([
		"Warning: Using a system table may cause unexpected behavior for other tests running in parallel",
		"Warning: Using a table that extends Application File [sys_metadata] may cause unexpected behavior for other tests running in parallel",
		"Warning: Modifying an existing record may cause unexpected behavior for other tests running in parallel",
		"Warning: Using an existing record may cause unexpected behavior for this test",
		"Warning: Impersonating an existing user may cause unexpected behavior for this test. Avoid potential issues by adding a 'Create a User' step instead",
		"See the documentation for Test Design Considerations",
		// messages exceeding the 255 character limit need a sys_ui_message
		"atf_design_warning_system_table",
		"atf_design_warning_metadata_table",
		"atf_design_warning_modify_existing_record",
		"atf_design_warning_using_existing_record",
		"atf_design_warning_existing_user"
	]);

	var stepConfig = g_form.getValue('step_config');
	if (!stepConfig || !stepConfigWarnings[stepConfig])
		return;

	var hasSystemTableWarning = false;
	var hasMetadataTableWarning = false;
	var hasRecordWarning = false;
	var hasUserWarning = false;
	var sysAtfStepPrefix = 'sys_atf_step.inputs.var__m_atf_input_variable_';
	var sysMappingPrefix = 'sys_mapping.' + sysAtfStepPrefix;
	var tableInputName = sysAtfStepPrefix + stepConfig + '.table';
	var gemTableInputName = sysMappingPrefix + stepConfig + '.table';
	var recordInputName = sysAtfStepPrefix + stepConfig + '.record_id';
	var gemRecordInputName = sysMappingPrefix + stepConfig + '.record_id';
	var sysIdInputName = sysAtfStepPrefix + stepConfig + '.param_sys_id';
	var gemSysIdInputName = sysMappingPrefix + stepConfig + '.param_sys_id';
	var userInputName = sysAtfStepPrefix + stepConfig + '.user';
	var gemUserInputName = sysMappingPrefix + stepConfig + '.user';

	// helper to set warning_message field used to generate step description
	function setWarningField() {
		var warningMessage = "";
		if (hasSystemTableWarning)
			warningMessage = messageMap["Warning: Using a system table may cause unexpected behavior for other tests running in parallel"];

		if (hasMetadataTableWarning) {
			var metadataTableWarning = messageMap["Warning: Using a table that extends Application File [sys_metadata] may cause unexpected behavior for other tests running in parallel"];
			warningMessage += (warningMessage != "" ? "\n" + metadataTableWarning : metadataTableWarning);
		}

		if (hasRecordWarning) {
			var recordWarning;
			if (stepConfigWarnings[stepConfig].indexOf("usage_warning") != -1)
				recordWarning = messageMap["Warning: Using an existing record may cause unexpected behavior for this test"];
			else
				recordWarning = messageMap["Warning: Modifying an existing record may cause unexpected behavior for other tests running in parallel"];
			warningMessage += (warningMessage != "" ? "\n" + recordWarning : recordWarning);
		}

		if (hasUserWarning) {
			var userWarning = messageMap["Warning: Impersonating an existing user may cause unexpected behavior for this test. Avoid potential issues by adding a 'Create a User' step instead"];
			warningMessage += (warningMessage != "" ? "\n" + userWarning : userWarning);
		}

		if (warningMessage)
			warningMessage += "\n" + messageMap["See the documentation for Test Design Considerations"];

		g_form.setValue("warning_message", warningMessage);
	}

	// helper to set warning_message, render field level warning, and convert warning to link
	function showWarning(inputName, translatedMessage) {
		// set warning_message to be used in step description generator
		setWarningField();

		// renders field level warning
		g_form.showFieldMsg(inputName, translatedMessage, "warning");

		// convert warning message to link
		var notificationElement = gel(inputName + "_fieldmsg");
		// make sure notification and child is present and innerText is set
		if (!notificationElement
			|| !notificationElement.childElements()
			|| !notificationElement.childElements()[0]
			|| !notificationElement.childElements()[0].innerText)
			return;

		var warningElement = notificationElement.childElements()[0];
		warningElement.innerHTML = warningElement.innerText;
	}

	// show a warning if table input variable value is a system table or extends sys_metadata
	function checkTable() {
		if (!gel(tableInputName))
			return;

		var tableValue = g_form.getValue(tableInputName);
		var gemElement = gel(gemTableInputName);
		var gemValue = null;
		if (gemElement)
			gemValue = gemElement.value;

		// if a GEM value is set or table is empty, there is no table warning so set warning_message
		if (gemValue || !tableValue) {
			hasSystemTableWarning = false;
			hasMetadataTableWarning = false;
			setWarningField();
			return;
		}

		// check if table is a system table
		if (tableValue.startsWith("sys_")) {
			hasSystemTableWarning = true;
			// because we just want to show 1 warning per field, even if the system table extends metadata, set hasMetadataTable warning to false
			hasMetadataTableWarning = false;
			showWarning(tableInputName, messageMap["atf_design_warning_system_table"]);
			return;
		}

		// check if table extends sys_metadata
		var ga = new GlideAjax('ATFClientUtil');
		ga.addParam('sysparm_name', 'extendsSysMetadata');
		ga.addParam('sysparm_table', tableValue);
		ga.getXMLAnswer(function(answer) {
			if (answer == 'true') {
				hasMetadataTableWarning = true;
				hasSystemTableWarning = false;
				showWarning(tableInputName, messageMap["atf_design_warning_metadata_table"]);
			}
		});

		// there are no table warnings so set warning_message
		hasSystemTableWarning = false;
		hasMetadataTableWarning = false;
		setWarningField();
	}

	// returns true if input variable needs a warning
	// util to check if reference field uses an existing record
	function referenceFieldHasWarning(inputName, gemInputName) {
		var inputValue = g_form.getValue(inputName);

		var gemElement = gel(gemInputName);
		var gemValue = null;
		if (gemElement)
			gemValue = gemElement.value;

		// if there is no GEM value and input value is not empty, return true to show warning
		if (!gemValue && inputValue)
			return true;

		return false;
	}

	// show a warning if record id input variable value is an existing record
	function checkRecord() {
		if (!gel(recordInputName))
			return;

		hasRecordWarning = referenceFieldHasWarning(recordInputName, gemRecordInputName);
		if (hasRecordWarning) {
			var recordWarning;
			if (stepConfigWarnings[stepConfig].indexOf("usage_warning") != -1)
				recordWarning = messageMap["atf_design_warning_using_existing_record"];
			else
				recordWarning = messageMap["atf_design_warning_modify_existing_record"];

			showWarning(recordInputName, recordWarning);
			return;
		}

		// there are no record warnings so set warning_message
		setWarningField();
	}

	// show a warning if user input variable value is an existing record
	function checkUser() {
		if (!gel(userInputName))
			return;

		hasUserWarning = referenceFieldHasWarning(userInputName, gemUserInputName);
		if (hasUserWarning) {
			showWarning(userInputName, messageMap["atf_design_warning_existing_user"]);
			return;
		}

		// there are no user warnings so set warning_message
		setWarningField();
	}

	// show a warning if sys_id input (type String) implies an existing record
	function checkSysIdField() {
		if (!gel(sysIdInputName))
			return;

		// get the sys_id from the string type field (stored in a sys_mapping element)
		var sysIdValue = g_form.getValue(gemSysIdInputName);
		var hasGemValue = false;
		if (sysIdValue)
			hasGemValue = sysIdValue.indexOf("{{") != -1;

		// if there is no GEM value and record value is not empty, show existing record warning
		if (!hasGemValue && sysIdValue) {
			hasRecordWarning = true;
			var recordWarning = messageMap["atf_design_warning_using_existing_record"];
			showWarning(sysIdInputName, recordWarning);
			return;
		}

		// there are no record warnings so set warning_message
		hasRecordWarning = false;
		setWarningField();
	}

	// add handler for step configs that need warnings if table extends sys_metadata or is a system table
	if (stepConfigWarnings[stepConfig].indexOf("check_table") !== -1) {
		// create onChange event handlers for table and add to g_event_handlers
		var tableOnChangeEvent = new GlideEventHandler('onChange_' + tableInputName, checkTable, tableInputName);
		g_event_handlers.push(tableOnChangeEvent);
	}

	// add handler for step configs that need warnings if using an existing record with type document id
	if (stepConfigWarnings[stepConfig].indexOf("check_record") !== -1) {
		// create onChange event handlers for record id and add to g_event_handlers
		var recordOnChangeEvent = new GlideEventHandler('onChange_' + recordInputName, checkRecord, recordInputName);
		g_event_handlers.push(recordOnChangeEvent);
	}

	// add handler for step configs that need warnings if specifying an existing record sys_id with type string
	if (stepConfigWarnings[stepConfig].indexOf("check_sys_id") !== -1) {
		// create onChange event handlers for sys id and add to g_event_handlers
		var sysIdOnChangeEvent = new GlideEventHandler('onChange_' + sysIdInputName, checkSysIdField, sysIdInputName);
		g_event_handlers.push(sysIdOnChangeEvent);
	}

	// add handler for step configs that need warnings if using an existing user
	if (stepConfigWarnings[stepConfig].indexOf("check_user") !== -1) {
		// create onChange event handlers for user and add to g_event_handlers
		var userOnChangeEvent = new GlideEventHandler('onChange_' + userInputName, checkUser, userInputName);
		g_event_handlers.push(userOnChangeEvent);
	}
}
