(function generateDescription(step) {
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	
	return gs.getMessage('Validate that the form matches the following condition:') + '\n' + 
		descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.conditions) +
		descriptionGenerator.getTimeoutDescription(step.timeout);
})(step);
