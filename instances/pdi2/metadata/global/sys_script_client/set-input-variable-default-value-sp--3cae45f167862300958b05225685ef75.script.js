function onLoad() {
	// return if not new step
	if (!g_form.isNewRecord())
		return;

	var stepConfig = g_form.getValue('step_config');
	var map = {
		// Submit a Form (SP) step config
		"f410c93423220300ab65ff5e17bf651e": [{inputVar: "assert_type", defaultValue: "form_submitted_to_server"}]
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

			if (g_form.getValue(inputVarId) === '')
				g_form.setValue(inputVarId, inputVarToSet["defaultValue"]);
		}
	}
}
