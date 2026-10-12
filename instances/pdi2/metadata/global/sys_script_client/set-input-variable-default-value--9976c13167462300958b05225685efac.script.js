function onLoad() {
	// return if not new step
	if (!g_form.isNewRecord())
		return;

	var navigatorDefaultValue = "ui16";
	var isPolarisEnabled = g_scratchpad.is_polaris_enabled;
	if (isPolarisEnabled === 'true')
		navigatorDefaultValue = "polaris";

	var stepConfig = g_form.getValue('step_config');
	var map = {
		// Submit a Form step config
		"be8e0a935332120028bc29cac2dc34e4": [{inputVar: "assert_type", defaultValue: "form_submitted_to_server", overrideValue: false}],
		// Record Query step config
		"0270b8005f30220012b44adb7f46666a": [{inputVar: "enforce_security", defaultValue: true, overrideValue: true}],
		// Module Visibility
		"f7cfc1973702030064a52f3c8e41f1d3": [{inputVar: "navigator", defaultValue: navigatorDefaultValue, overrideValue: true}],
		// Application Menu Visibility
		"6228cf753752030064a52f3c8e41f1a8": [{inputVar: "navigator", defaultValue: navigatorDefaultValue, overrideValue: true}]
		// add new step configs, input variables, and default values here
	};

	// return if step config is not in the list of steps that need defaults set
	if (stepConfig && Object.keys(map).indexOf(stepConfig) === -1)
		return;

	for (var stepConfigToSet in map) {
		var inputVarsToSetArr = map[stepConfigToSet];
		for (var i = 0; i < inputVarsToSetArr.length; i += 1) {
			var inputVarToSet = inputVarsToSetArr[i];
			var inputVarId = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfigToSet + "." + inputVarToSet["inputVar"];
			// continue to next input variable if input variable to set isn't present
			if (!gel(inputVarId))
				continue;

			// set if empty or overrideValue is true
			if (g_form.getValue(inputVarId) === '' || inputVarToSet["overrideValue"])
				g_form.setValue(inputVarId, inputVarToSet["defaultValue"]);
		}
	}
}
