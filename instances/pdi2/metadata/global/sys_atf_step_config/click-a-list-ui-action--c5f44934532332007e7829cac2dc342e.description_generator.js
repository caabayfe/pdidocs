function generateDescription() {
	var isRelatedList = !(step.inputs.list_type == 'list');
	var relTd = GlideTableDescriptor.get(step.inputs.related_list_table);
	var relatedListTable = step.inputs.related_list_table.getDisplayValue();
	if (relTd)
		relatedListTable = relTd.getLabel();

	var formTd = GlideTableDescriptor.get(step.inputs.table);
	var formTable = step.inputs.table.getDisplayValue();
	if (formTd)
		formTable = formTd.getLabel();

	var actionTypeDisplayValue = step.inputs.action_type.getDisplayValue().toLowerCase();
	var listActionDisplayValue = step.inputs.list_action.getDisplayValue();

	var description = "";
	if (step.inputs.assert_type == "page_reloaded_or_redirected") {
		if (isRelatedList)
			description = gs.getMessage("Click the {0} UI action '{1}' in the '{2}' related list on the '{3}' form and assert the page reloads or redirects within {4}",
				[actionTypeDisplayValue, listActionDisplayValue, relatedListTable, formTable, step.timeout.getDisplayValue()]);
		else
			description = gs.getMessage("Click the {0} UI action '{1}' in the '{2}' list and assert the page reloads or redirects within {3}",
				[actionTypeDisplayValue, listActionDisplayValue, relatedListTable, step.timeout.getDisplayValue()]);
	} else {
		if (isRelatedList)
			description = gs.getMessage("Click the {0} UI action '{1}' in the '{2}' related list on the '{3}' form",
				[actionTypeDisplayValue, listActionDisplayValue, relatedListTable, formTable]);
		else
			description = gs.getMessage("Click the {0} UI action '{1}' in the '{2}' list",
				[actionTypeDisplayValue, listActionDisplayValue, relatedListTable]);
	}

	var applyTo = step.inputs.apply_to.toString();
	if (applyTo) {
		if (applyTo === "all_records")
			description += "\n" + gs.getMessage("Apply the action to all records visible on the first page of the list");
		else if (applyTo === "single_record")
			description += "\n" + gs.getMessage("Apply the action to the record '{0}'", step.inputs.record_id.getDisplayValue());
	}

	return description;
}
 generateDescription();
