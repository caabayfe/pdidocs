function onCondition() {
	// set timeout to 5 seconds if creating a new step
	if (g_form.isNewRecord()) {
		// unless it is a 'Navigate to Module' step
		if (g_form.getValue('step_config') != 'c832fc4073720300c79260bdfaf6a7a0')
			g_form.setValue("timeout", "0 00:00:05");

		//Validate email steps need 30 second timeouts
		if (g_form.getValue('step_config') == '0d09dae4c3033300eaac11fe81d3ae1a' ||
			g_form.getValue('step_config') == 'a5600fa0c3033300eaac11fe81d3ae6a' ||
			g_form.getValue('step_config') == '32911152c3833300eaac11fe81d3ae82')
			g_form.setValue("timeout", "0 00:00:30");
	}
}
