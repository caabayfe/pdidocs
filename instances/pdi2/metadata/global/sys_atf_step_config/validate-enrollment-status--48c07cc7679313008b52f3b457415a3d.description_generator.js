function generateDescription() {
    // the global variable 'step' represents the current glide record
    var description = gs.getMessage('Assert that user "{0}" is enrolled with process "{1}"',
					[step.inputs.user.getDisplayValue(), step.inputs.process.getDisplayValue()]);
	
	return description;
}
 generateDescription();
