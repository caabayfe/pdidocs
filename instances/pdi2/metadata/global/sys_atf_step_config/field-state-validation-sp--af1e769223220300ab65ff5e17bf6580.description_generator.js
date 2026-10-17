(function generateDescription(step) {
    var description = "";
	var table = step.inputs.table;
	if (!gs.nil(step.inputs.visible))
		description = gs.getMessage("Confirm that the following fields are visible: {0}", getFields(step.inputs.visible, table));

	if (!gs.nil(step.inputs.not_visible))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following fields are not visible: {0}", getFields(step.inputs.not_visible, table));

	if (!gs.nil(step.inputs.read_only))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following fields are read only: {0}", getFields(step.inputs.read_only, table));

	if (!gs.nil(step.inputs.not_read_only))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following fields are not read only: {0}", getFields(step.inputs.not_read_only, table));

	if (!gs.nil(step.inputs.mandatory))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following fields are mandatory: {0}", getFields(step.inputs.mandatory, table));

	if (step.inputs.not_mandatory)
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following fields are not mandatory: {0}", getFields(step.inputs.not_mandatory, table));

	var timeoutDescription = new ATFStepDescriptionGenerator().getTimeoutDescription(step.timeout);
	description += timeoutDescription;

	return description;
})(step);
function getFields(fields, table) {
	var fieldElements = fields.split(",");
	var fieldNames = [];

	for (var i = 0; i < fieldElements.length; i++) {
		var fieldName = new sn_atf.UserTestProcessor().getFieldName(table, fieldElements[i]);
		fieldNames.push(fieldName);
	}
	return fieldNames.join(", ");
}
