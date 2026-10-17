(function generateDescription(step) {
	var assertType = step.inputs.assert_type;
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description = gs.getMessage("Update a record in '{0}' with the following values:\n", step.inputs.table);
	description += descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values);
	if (assertType == 'record_not_updated')
		description += "\n" + gs.getMessage("Confirm the record was not updated");
	else
		description += "\n" + gs.getMessage("Confirm the record was successfully updated");

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
