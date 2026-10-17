(function generateDescription(step) {
	var description;
	var assertType = step.inputs.assert_type;
	var form_ui = step.inputs.form_ui;
	var isInStandardUI = !form_ui || form_ui == "standard_ui";

	if (assertType == 'form_submitted_to_server') {
		if (isInStandardUI)
			description = gs.getMessage("Submit the current form and confirm form submitted to server");
		else
			description = gs.getMessage("Submit the current form and confirm form submitted to server in '{0}'", form_ui.getDisplayValue());
	} else if (assertType == 'form_submission_canceled_in_browser') {
		if (isInStandardUI)
			description = gs.getMessage("Submit the current form and confirm form submission canceled in browser");
		else
			description = gs.getMessage("Submit the current form and confirm form submission canceled in browser in '{0}'", form_ui.getDisplayValue());
	} else {
		if (isInStandardUI)
			description = gs.getMessage("Submit the current form");
		else
			description = gs.getMessage("Submit the current form in '{0}'", form_ui.getDisplayValue());
	}

	// if we're in a workspace step, a timeout may be applied to this step
	if (!isInStandardUI)
		description += new ATFStepDescriptionGenerator().getTimeoutDescription(step.timeout);

	return description;
})(step);
