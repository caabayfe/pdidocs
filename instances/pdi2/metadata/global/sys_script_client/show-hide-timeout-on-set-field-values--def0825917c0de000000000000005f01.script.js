function onLoad() {
	var STANDARD_UI = "standard_ui";
	var TIMEOUT = "timeout";
	var setFieldValuesStepConfig = 'fcae4a935332120028bc29cac2dc340e';
	// this only applies to "Set Field Values" step
	if (g_form.getValue('step_config') !== setFieldValuesStepConfig)
		return;

	var formUIId = "sys_atf_step.inputs.var__m_atf_input_variable_" + setFieldValuesStepConfig + ".form_ui";
	var formUIElement = gel(formUIId);
	if (!formUIElement)
		return;

	var initalFormUI = g_form.getValue(formUIId);
	if (!initalFormUI || initalFormUI === STANDARD_UI)
		g_form.setVisible(TIMEOUT, false);

	var onChangeFunction = formUIElement.onchange;
	formUIElement.onchange = function() {
		if (onChangeFunction)
			onChangeFunction();

		var formUI = g_form.getValue(formUIId);
		if (!formUI || formUI === STANDARD_UI)
			g_form.setVisible(TIMEOUT, false);
		else
			g_form.setVisible(TIMEOUT, true);
	};
}
