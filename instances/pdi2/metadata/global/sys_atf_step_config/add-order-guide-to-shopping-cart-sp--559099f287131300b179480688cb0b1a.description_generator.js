function generateDescription() {
    // the global variable 'step' represents the current glide record
    var description = "";
	if (step.inputs.assert_type == 'form_submitted_to_server')
		description = gs.getMessage("Add order guide to cart and confirm addition of order guide to cart");
	else if  (step.inputs.assert_type == 'form_submission_cancelled_in_browser')
		description = gs.getMessage("Add order guide to cart and confirm addition is canceled in browser");
	return description;
}
 generateDescription();
