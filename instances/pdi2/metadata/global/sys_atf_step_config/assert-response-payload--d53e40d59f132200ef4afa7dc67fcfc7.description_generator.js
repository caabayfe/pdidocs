function generateDescription() {	
	if(step.inputs.response_operation == 'exists')		
		return gs.getMessage("Assert a response payload {0}", [ 
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation)]);
	else
		return gs.getMessage("Assert a response payload {0} '{1}'", [
		(new ATFStepDescriptionGenerator()).getOperatorDescription(step.inputs.response_operation), 
		(new ATFStepDescriptionGenerator()).limitTextToSpecifiedLength(step.inputs.response_body, 50)]);
}
generateDescription();
