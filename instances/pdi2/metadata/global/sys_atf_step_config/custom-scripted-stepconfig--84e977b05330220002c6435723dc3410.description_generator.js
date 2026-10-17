function generateDescription() {
	// the global variable 'step' represents the current glide record
    var description = gs.getMessage("Assert that the name of user '{0}' starts with 'A'",
									step.inputs.user.getDisplayValue());

	return description;
}
 generateDescription();
