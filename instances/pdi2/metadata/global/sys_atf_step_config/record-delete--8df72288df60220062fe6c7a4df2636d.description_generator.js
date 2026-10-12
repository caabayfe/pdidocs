(function generateDescription(step) {
	var td = GlideTableDescriptor.get(step.inputs.table);
	var description;

	if (!td)
		description = gs.getMessage("Invalid table name '{0}'", step.inputs.table);

	var assertType = step.inputs.assert_type;
	if (assertType == 'record_not_deleted')
		description = gs.getMessage("Delete record '{0}' and confirm record was not deleted",
						 step.inputs.record_id.getDisplayValue());
	else
		description = gs.getMessage("Delete record '{0}' and confirm record was deleted",
						 step.inputs.record_id.getDisplayValue());

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
