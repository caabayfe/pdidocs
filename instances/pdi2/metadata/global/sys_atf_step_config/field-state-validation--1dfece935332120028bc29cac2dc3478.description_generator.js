(function generateDescription(step) {
    var description = "";
	var table = step.inputs.table;

	if (step.inputs.form_ui.toString() === "standard_ui")
		description = GlideSysMessage.format("Assert the following:");
	else
		description = GlideSysMessage.format("Assert the following in '{0}':", step.inputs.form_ui.getDisplayValue());

	var descGenerator = new ATFStepDescriptionGenerator();
	if (!gs.nil(step.inputs.visible))
		description += (description ? ("\n") : "") + gs.getMessage("The following fields are visible: {0}", descGenerator.getFields(step.inputs.visible, table));

	if (!gs.nil(step.inputs.not_visible))
		description += (description ? ("\n") : "") + gs.getMessage("The following fields are not visible: {0}", descGenerator.getFields(step.inputs.not_visible, table));

	if (!gs.nil(step.inputs.read_only))
		description += (description ? ("\n") : "") + gs.getMessage("The following fields are read only: {0}", descGenerator.getFields(step.inputs.read_only, table));

	if (!gs.nil(step.inputs.not_read_only))
		description += (description ? ("\n") : "") + gs.getMessage("The following fields are not read only: {0}", descGenerator.getFields(step.inputs.not_read_only, table));

	if (!gs.nil(step.inputs.mandatory))
		description += (description ? ("\n") : "") + gs.getMessage("The following fields are mandatory: {0}", descGenerator.getFields(step.inputs.mandatory, table));

	if (step.inputs.not_mandatory)
		description += (description ? ("\n") : "") + gs.getMessage("The following fields are not mandatory: {0}", descGenerator.getFields(step.inputs.not_mandatory, table));


	var timeoutDescription = descGenerator.getTimeoutDescription(step.timeout);
	description += timeoutDescription;

	return description;
})(step);
