function generateDescription() {
    // the global variable 'step' represents the current glide record
	var description = "";
	if (step.inputs.variable_values)
		description = gs.getMessage("Answer the questions on the form as follows:") + "\n";
	description += new SCATFUtil().getValueValidationDescription(step.inputs.variable_values);
	return description;
}
 generateDescription();
