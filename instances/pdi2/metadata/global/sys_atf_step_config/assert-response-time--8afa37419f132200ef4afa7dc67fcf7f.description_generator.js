function generateDescription() {
	return gs.getMessage("Assert a response time {0} '{1}'", [
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation), step.inputs.response_time]);
}
generateDescription();
