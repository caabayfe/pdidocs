function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue != "async") {
		if (typeof g_form.asyncLegacyMsg != "undefined") {
			g_form.hideFieldMsg("when");  // Message already has been displayed, clear it.
			g_form.asyncLegacyMsg = true;
		}
		return;
	}


	g_form.asyncLegacyMsg = true;
	var msg = getMessage("This async rule is deprecated as it will NOT run during upgrade. It is recommended that you switch to the new 'async' option.");
	g_form.showFieldMsg("when", msg, "warning", true);
}
