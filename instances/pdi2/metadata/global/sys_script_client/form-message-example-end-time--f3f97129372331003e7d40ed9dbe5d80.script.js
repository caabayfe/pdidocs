function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	var invalidDuration = g_user.getClientData('invalidDuration');
	if (!invalidDuration) {
		// getExampleSLABreachTime defined in onLoad client script 'Form message - Example end time'
		getExampleSLABreachTime(function(answer) {
			clearNonPermanentMessages();
			g_form.addInfoMessage(answer, "example_breach_time");
		});
	}
}
