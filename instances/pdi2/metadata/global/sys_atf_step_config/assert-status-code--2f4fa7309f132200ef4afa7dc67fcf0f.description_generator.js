function generateDescription() {
	return gs.getMessage("Assert a response status code {0} '{1}'", [
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation), step.inputs.status_code]);
}
generateDescription();
