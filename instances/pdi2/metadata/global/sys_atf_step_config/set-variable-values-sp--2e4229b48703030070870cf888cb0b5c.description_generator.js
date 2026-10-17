function generateDescription() {
    // the global variable 'step' represents the current glide record
    var description = "";
	if (step.inputs.variable_values && step.inputs.variable_set.getDisplayValue() == '')
		description = gs.getMessage("Answer the questions on the form as follows:");
	else
		description = gs.getMessage("Answer the questions on the form for variable set '{0}' as follows:", step.inputs.variable_set.getDisplayValue());
	description += "\n";
	description += new SCATFUtil().getValueValidationDescription(step.inputs.variable_values);
	return description;
}
 generateDescription();
