(function generateDescription(step) {	
	if (step.inputs.assert_type == "form_submitted_to_server") {
		return gs.getMessage("Submit the current form and confirm form submitted to server");
	} else if (step.inputs.assert_type == "form_submission_canceled_in_browser") {
		return gs.getMessage("Submit the current form and confirm form submission canceled in browser");
	} else {
		return gs.getMessage("Submit the current form");
	}
})(step);
