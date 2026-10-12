function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	g_form.addInfoMessage("Making the notification mandatory will override all other user preferences for this notification.");
}
