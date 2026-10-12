function generateDescription() {
    var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description = gs.getMessage('Set the values on the form as follows:') + '\n' +
		descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values);

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
}

generateDescription();
