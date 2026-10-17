function onLoad() {
   //Type appropriate comment here, and begin script below
   var clickUIStepConfig = "0f4a128297202200abe4bb7503ac4af0";
   var stepConfig = g_form.getValue("step_config");

   if (!stepConfig || stepConfig !== clickUIStepConfig)
		return;

	var formUIInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".form_ui";
	var actionTypeInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".action_type";
	var uiActionInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".ui_action";
	var declarativeActionInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".declarative_action";

	function checkActionType() {
		var formUI = g_form.getValue(formUIInputName);
		var actionType = g_form.getValue(actionTypeInputName);
		
		var actionTypeElement = gel("element." + actionTypeInputName);
		var uiActionElement = gel("element." + uiActionInputName);
		var declarativeActionElement = gel("element." + declarativeActionInputName);

		if (!actionTypeElement || !uiActionElement || !declarativeActionElement)
			return;

		if (formUI == "standard_ui" || !g_scratchpad.declarative_actions) {
			uiActionElement.setAttribute('style', '');
			g_form.setMandatory("ui_action", true);
			actionTypeElement.setAttribute('style', 'display: none;');
			declarativeActionElement.setAttribute('style', 'display: none;');
			return;
		} else {
			// Make our action type appear after toggling from standard UI
			actionTypeElement.setAttribute('style', '');
		}
	
		if (actionType == "declarative_action") {
			uiActionElement.setAttribute('style', 'display: none;');
			g_form.setMandatory("ui_action", false);
			declarativeActionElement.setAttribute('style', '');
			g_form.setMandatory("declarative_action", true);
		} else {
			uiActionElement.setAttribute('style', '');
			g_form.setMandatory("ui_action", true);
			declarativeActionElement.setAttribute('style', 'display: none;');
			g_form.setMandatory("declarative_action", false);
		}
	}

	function checkFormUIType() {
		var formUI = g_form.getValue(formUIInputName);
		if (formUI == "standard_ui")
			g_form.setValue(actionTypeInputName, "ui_action");
		else
			checkActionType();
	}

	var actionTypeOnChangeEvent = new GlideEventHandler('onChange_' + actionTypeInputName, checkActionType, actionTypeInputName);
	var formUITypeOnChangeEvent = new GlideEventHandler('onChange_' + formUIInputName, checkFormUIType, formUIInputName);

	g_event_handlers.push(actionTypeOnChangeEvent);
	g_event_handlers.push(formUITypeOnChangeEvent);
}
