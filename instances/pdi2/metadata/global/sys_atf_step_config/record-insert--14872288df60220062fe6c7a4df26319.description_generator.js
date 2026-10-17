(function generateDescription(step) {
	var assertType = step.inputs.assert_type;
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description = gs.getMessage("Insert a record into '{0}' with the following values:\n", step.inputs.table);
	description += descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values);
	if (assertType == 'record_not_inserted')
		description += "\n" + gs.getMessage("Confirm the record was not inserted");
	else
		description += "\n" + gs.getMessage("Confirm the record was successfully inserted");

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
