function generateDescription(step) {
    // the global variable 'step' represents the current glide record
    var description = "";
	if (step.inputs.assert_type == 'form_submitted_to_server')
		description = gs.getMessage("Submit the Record Producer and confirm submission to server");
	else if  (step.inputs.assert_type == 'form_submission_cancelled_in_browser')
		description = gs.getMessage("Submit the Record Producer and confirm submission canceled in browser");
	return description;
}
 generateDescription(step);
