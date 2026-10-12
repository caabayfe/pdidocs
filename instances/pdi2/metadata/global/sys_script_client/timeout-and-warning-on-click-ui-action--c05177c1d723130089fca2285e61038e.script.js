function onLoad() {
	var clickUIActionStepConfig = '0f4a128297202200abe4bb7503ac4af0';

	// this only applies if step config is "Click a UI Action"
	if (g_form.getValue('step_config') !== clickUIActionStepConfig)
		return;

	var messageMap = new GwtMessage().getMessages([
		"Warning: Using assert type '-- None --' may cause unexpected behavior for server UI actions. Avoid potential issues by setting the assert type and using a timeout",
		"See the documentation for Test Design Considerations",
		"atf_design_warning_server_ui_action"
	]);

	var WARNING_MESSAGE = messageMap["Warning: Using assert type '-- None --' may cause unexpected behavior for server UI actions. Avoid potential issues by setting the assert type and using a timeout"] + "\n" + messageMap["See the documentation for Test Design Considerations"];
	var WARNING_FIELD_MESSAGE = messageMap["atf_design_warning_server_ui_action"];
	var hasWarningMessage = false;

	var uiActionId = "sys_atf_step.inputs.var__m_atf_input_variable_" + clickUIActionStepConfig + ".ui_action";
	var uiActionElement = gel(uiActionId);
	if (!uiActionElement)
		return;

	var assertTypeId = "sys_atf_step.inputs.var__m_atf_input_variable_" + clickUIActionStepConfig + ".assert_type";
	var assertTypeElement = gel(assertTypeId);
	if (!assertTypeElement)
		return;

	var formUIId = "sys_atf_step.inputs.var__m_atf_input_variable_" + clickUIActionStepConfig + ".form_ui";
	var formUIElement = gel(formUIId);

	function isWorkspace() {
		var formUIValue = g_form.getValue(formUIId);
		return formUIValue && formUIValue !== "standard_ui";
	}

	function clearWarning() {
		g_form.setValue("warning_message", "");
		g_form.hideFieldMsg(assertTypeId, "warning");
		hasWarningMessage = false;
	}

	function checkUIAction() {
		var assertTypeValue = g_form.getValue(assertTypeId);
		var uiActionSysId = g_form.getValue(uiActionId);
		g_form.addOption(assertTypeId, "", "-- None --", 0);

		// if the UI action has not been set, just return because there is nothing to query
		if (uiActionSysId === "")
			return;

		// check if UI action is a server UI action
        var ga = new GlideAjax('ATFClientUtil');
		ga.addParam('sysparm_name', 'isClientUIAction');
		ga.addParam('sysparm_ui_action_sys_id', uiActionSysId);
		ga.getXMLAnswer(function(answer) {
			// if UI action is a client UI action ("true"), then clear all warning fields
			if (answer === "true") {
				clearWarning();
				return;
			}

			g_form.setVisible("timeout", true);
		});
	}

	function checkAssert() {
		var assertTypeValue = g_form.getValue(assertTypeId);
		var uiActionSysId = g_form.getValue(uiActionId);

		if (isWorkspace() || g_form.getValue(assertTypeId) !== "")
			g_form.setVisible("timeout", true);
		else
			g_form.setVisible("timeout", false);

		// if assert type is set, clear all warning fields and return
		if (assertTypeValue !== "" || uiActionSysId == "") {
			clearWarning();
			return;
		}

		// check if UI action is a server UI action
		var ga = new GlideAjax('ATFClientUtil');
		ga.addParam('sysparm_name', 'isClientUIAction');
		ga.addParam('sysparm_ui_action_sys_id', uiActionSysId);
		ga.getXMLAnswer(function(answer) {
			// if UI action is a client UI action ("true"), then clear all warning fields and return
			if (answer === "true") {
				clearWarning();
				return;
			}

			if (hasWarningMessage)
				return;

			g_form.setValue("warning_message", WARNING_MESSAGE);
			g_form.showFieldMsg(assertTypeId, WARNING_FIELD_MESSAGE, "warning");
			hasWarningMessage = true;

			// convert warning message to link
			var notificationElement = gel(assertTypeId + "_fieldmsg");
			// make sure notification and child is present and innerText is set
			if (!notificationElement
				|| !notificationElement.childElements()
				|| !notificationElement.childElements()[0]
				|| !notificationElement.childElements()[0].innerText)
				return;

			var warningElement = notificationElement.childElements()[0];
			warningElement.innerHTML = warningElement.innerText;
		});
	}

	// create onChange event handler for UI action and assert type, then add to g_event_handlers
	var uiActionOnChangeEvent = new GlideEventHandler('onChange_' + uiActionId, checkUIAction, uiActionId);
	var assertTypeOnChangeEvent = new GlideEventHandler('onChange_' + assertTypeId, checkAssert, assertTypeId);
	g_event_handlers.push(uiActionOnChangeEvent);
	g_event_handlers.push(assertTypeOnChangeEvent);

	checkAssert();
	if (formUIElement) {
		var formUIOnChange = formUIElement.onchange;
		formUIElement.onchange = function() {
			if (formUIOnChange)
				formUIOnChange();
			checkAssert();
		};
	}
}
