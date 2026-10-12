function generateDescription() {
	if(step.inputs.response_operation == 'exists')		
		return gs.getMessage("Assert a response header '{0}' {1}", [
		(new ATFStepDescriptionGenerator()).limitTextToSpecifiedLength(step.inputs.header_name, 50), 
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation)]);
	else
		return gs.getMessage("Assert a response header '{0}' {1} '{2}'", [
		(new ATFStepDescriptionGenerator()).limitTextToSpecifiedLength(step.inputs.header_name, 50),
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation), 
		(new ATFStepDescriptionGenerator()).limitTextToSpecifiedLength(step.inputs.header_value, 50)]);
}
generateDescription();
