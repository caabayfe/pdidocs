(function generateDescription(step) {
    var description = "";
	
	var isRelatedList = !(step.inputs.list_type == "list");

	if (gs.nil(step.inputs.visible.getDisplayValue()) && gs.nil(step.inputs.not_visible.getDisplayValue())) {
		description = gs.getMessage("This step will do nothing. Provide at least one UI action to assert as visible or not visible");
		return description;
	}

	var relTd = GlideTableDescriptor.get(step.inputs.related_list_table);
	var relatedListTable = step.inputs.related_list_table.getDisplayValue();
	if (relTd)
		relatedListTable = relTd.getLabel();

	var formTd = GlideTableDescriptor.get(step.inputs.table);
	var formTable = step.inputs.table.getDisplayValue();
	if (formTd)
		formTable = formTd.getLabel();

	if (!gs.nil(step.inputs.visible.getDisplayValue())) {
		if (isRelatedList)
			description = gs.getMessage("Confirm that the following UI actions on the '{0}' related list on the '{1}' form are visible: {2}", [relatedListTable, formTable, step.inputs.visible.getDisplayValue()]);
		else
			description = gs.getMessage("Confirm that the following UI actions on the '{0}' list are visible: {1}", [formTable, step.inputs.visible.getDisplayValue()]);
	}

	if (!gs.nil(step.inputs.not_visible.getDisplayValue())) {
		var notVisibleDescription;
		if (isRelatedList)
			notVisibleDescription = gs.getMessage("Confirm that the following UI actions on the '{0}' related list on the '{1}' form are not visible: {2}", [relatedListTable, formTable, step.inputs.not_visible.getDisplayValue()]);
		else
			notVisibleDescription = gs.getMessage("Confirm that the following UI actions on the '{0}' list are not visible: {1}", [formTable, step.inputs.not_visible.getDisplayValue()]);
		description += (description ? ("\n") : "") + notVisibleDescription;
	}

	return description;
})(step);
