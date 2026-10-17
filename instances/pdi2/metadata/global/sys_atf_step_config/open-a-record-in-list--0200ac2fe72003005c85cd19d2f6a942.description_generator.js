function generateDescription() {
	var description = '';
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var isRelatedList = !(step.inputs.list_type == 'list');
	var record = step.inputs.record_id;
	var relatedListUtil = "";
	var relatedListLabel = "";

	if (isRelatedList) {
		relatedListUtil = new ATFRelatedListUtil();
		relatedListLabel = relatedListUtil.getRelatedListLabels(step.inputs.table, step.inputs.related_list);
	}

	var formTd = GlideTableDescriptor.get(step.inputs.table);
	var formTable = step.inputs.table;
	if (formTd)
		formTable = formTd.getLabel();

	if (isRelatedList)
		description += gs.getMessage("Open the record '{0}' in the '{1}' related list on the '{2}' form", [record.getDisplayValue(), relatedListLabel, formTable]);
	else
		description += gs.getMessage("Open the record '{0}' in the '{1}' list", [record.getDisplayValue(), formTable]);

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
}
 generateDescription();
