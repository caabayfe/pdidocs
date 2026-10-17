function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	// validateDurationGetExampleBreach defined in onLoad client script 'Form message - Example end time'
	validateDurationGetExampleBreach(function(answer) {
		g_form.hideFieldMsg("duration");
		if (!answer)
			return;
		var answerObj = JSON.parse(answer);
		if (answerObj.durationMessage) {
			clearNonPermanentMessages(); //Remove the example breach message at the top of the form
			g_form.showFieldMsg("duration", answerObj.durationMessage, "error");
			g_user.setClientData('invalidDuration', true);
		} else {
			g_user.setClientData('invalidDuration', false);
			clearNonPermanentMessages();
			if (answerObj.breachTime)
				g_form.addInfoMessage(answerObj.breachTime, "example_breach_time");
		}
	});
}
