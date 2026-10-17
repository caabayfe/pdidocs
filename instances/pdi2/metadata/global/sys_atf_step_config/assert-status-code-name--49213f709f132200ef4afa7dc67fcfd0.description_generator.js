function generateDescription() {
	return gs.getMessage("Assert a response status code name {0} '{1}'", [
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation), 
		(new ATFStepDescriptionGenerator()).limitTextToSpecifiedLength(step.inputs.code_name, 50)]);
}
generateDescription();
