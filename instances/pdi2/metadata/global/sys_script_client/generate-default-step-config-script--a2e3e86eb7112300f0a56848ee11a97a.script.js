function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	// Determine whether the record (as stored in the database) is currently using any of the default scripts
	// g_scratchpad is loaded with the default step configs in the "Default Script Field Values" business rule
	var defaultStepConfigs = g_scratchpad.defaultStepConfigs;
	var isDefault = false;
	var currentScript = g_form.getValue("step_execution_generator");
	for (var i in defaultStepConfigs) {
		if (defaultStepConfigs[i] === currentScript) {
			isDefault = true;
			break;
		}
	}

	// The script should not be changed if it's already been customized from the default
	if (isDefault) {
		// If any changes have been made to the script do not alter it (even if the form hasn't been saved yet)
		if (g_form.modifiedFields["sys_atf_step_config.step_execution_generator"] !== true) {
			// Determine if the step environment is UI (if) or any of the server types (else)
			if (g_form.getValue("step_env") === "d2cb02e1870312009dccc9ded0e3ec7c")
				g_form.setValue("step_execution_generator", defaultStepConfigs.ui);
			else
				g_form.setValue("step_execution_generator", defaultStepConfigs.server);
		}
	}
}
