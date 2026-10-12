(function generateDescription(step) {
	var assertType = step.inputs.assert_type;
	if (assertType == 'record_not_found')
		return gs.getMessage("Validate that record '{0}' does not exist", step.inputs.record_id.getDisplayValue());
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description = GlideSysMessage.format("Validate record from table '{0}' matches the following condition:", step.inputs.table) + "\n";
	description += descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values);
	description += descriptionGenerator.getTimeoutDescription(step.timeout);

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
