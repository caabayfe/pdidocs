function generateDescription() {
    // the global variable 'step' represents the current glide record
    var description = "";
	if (step.inputs.assert_type == 'form_submitted_to_server')
		description = gs.getMessage("Add item to cart and confirm addition of item to cart");
	else if  (step.inputs.assert_type == 'form_submission_cancelled_in_browser')
		description = gs.getMessage("Add item to cart and confirm addition is canceled in browser");
	return description;
}
 generateDescription();
