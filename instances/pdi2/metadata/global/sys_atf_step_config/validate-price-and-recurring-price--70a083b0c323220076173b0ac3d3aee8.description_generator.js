function generateDescription(step) {
    // the global variable 'step' represents the current glide record
	var description = "";
	if (step.inputs.price)
		description += gs.getMessage("Validate that price is {0}", step.inputs.price) + "\n";
	
	if (step.inputs.recurring_price)
		description += gs.getMessage("Validate that recurring price is {0}", step.inputs.recurring_price) + "\n";

	if (step.inputs.recurring_frequency)
		description += gs.getMessage("Validate that recurring price frequency is {0}", step.inputs.recurring_frequency) + "\n";

	return description;
}
 generateDescription(step);
