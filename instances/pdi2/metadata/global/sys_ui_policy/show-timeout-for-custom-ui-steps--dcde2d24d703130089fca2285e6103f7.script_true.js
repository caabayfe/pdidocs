function onCondition() {
	if (g_form.isNewRecord()) {
		// unless it is a 'Navigate to Module' step
		if (g_form.getValue('step_config') != 'c832fc4073720300c79260bdfaf6a7a0')
			g_form.setValue("timeout", "0 00:00:05");
	}
}
