(function generateDescription(step) {
	var td = GlideTableDescriptor.get(step.inputs.table);
	if (!td) {
		gs.log("Invalid table name in test step: " + step.inputs.table);
		return gs.getMessage("Set field values");
	}
    var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description;
	var assertType = step.inputs.assert_type;
	if (assertType == 'no_records_match_query')
		description = gs.getMessage("Validate there are not any records in '{0}' matching query:\n{1}",
									[step.inputs.table.getDisplayValue(),
									 descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values)]);
	else
		description = gs.getMessage("Validate there is at least one record in '{0}' matching query:\n{1}",
									[step.inputs.table.getDisplayValue(),
									 descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values)]);
	description += descriptionGenerator.getTimeoutDescription(step.timeout);
	return description;

})(step);
