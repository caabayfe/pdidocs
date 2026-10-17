function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || !g_form.getValue('duration'))
		return;

	var invalidDuration = g_user.getClientData('invalidDuration');
	if (!newValue && !invalidDuration) {
		// getExampleSLABreachTime defined in onLoad client script 'Form message - Example end time'
		getExampleSLABreachTime(function(answer) {
			clearNonPermanentMessages();
			g_form.addInfoMessage(answer, "example_breach_time");
		});
	} else
		clearNonPermanentMessages();
}
