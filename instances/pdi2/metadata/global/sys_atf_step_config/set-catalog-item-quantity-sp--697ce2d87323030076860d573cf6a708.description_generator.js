function generateDescription() {
    // the global variable 'step' represents the current glide record
    var description = gs.getMessage("Set quantity to {0}", step.inputs.quantity);
	return description;
}
 generateDescription();
