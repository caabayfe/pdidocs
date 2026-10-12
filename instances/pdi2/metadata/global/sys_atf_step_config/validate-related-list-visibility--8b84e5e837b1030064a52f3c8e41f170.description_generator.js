(function generateDescription(step) {
	if (gs.nil(step.inputs.visible.toString()) && gs.nil(step.inputs.not_visible.toString()))
		return gs.getMessage("No related lists selected");

	var formTable = step.inputs.table;
	var formTd = GlideTableDescriptor.get(step.inputs.table);
	if (formTd)
		formTable = formTd.getLabel();

	var relatedListUtil = new ATFRelatedListUtil();
	var description = "";
	if (!gs.nil(step.inputs.visible.toString()))
		description += gs.getMessage("Confirm that the following related lists are visible on the '{0}' form: {1}",
			[formTable, relatedListUtil.getRelatedListLabels(step.inputs.table, step.inputs.visible)]);

	if (!gs.nil(step.inputs.not_visible.toString()))
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following related lists are not visible on the '{0}' form: {1}",
			[formTable, relatedListUtil.getRelatedListLabels(step.inputs.table, step.inputs.not_visible)]);

	return description;
})(step);
