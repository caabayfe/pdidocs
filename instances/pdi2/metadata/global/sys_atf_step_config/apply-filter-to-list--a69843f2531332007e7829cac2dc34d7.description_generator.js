function generateDescription() {
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var relTd = GlideTableDescriptor.get(step.inputs.related_list_table);
	var relatedListTable = step.inputs.related_list_table;
	if (relTd)
		relatedListTable = relTd.getLabel();

	var formTd = GlideTableDescriptor.get(step.inputs.table);
	var formTable = step.inputs.table;
	if (formTd)
		formTable = formTd.getLabel();

	// Generate string for assertion type -- assertion is optional so the default is empty string
	var assertion = "";
	if (step.inputs.assert_type == "exactly_one_match")
		assertion = gs.getMessage("Assert that exactly one record matches");
	else if (step.inputs.assert_type == "records_match_filter")
		assertion = gs.getMessage("Assert that at least one record matches");
	else if (step.inputs.assert_type == "no_records_match_filter")
		assertion = gs.getMessage("Assert that no records match");

	var isRelatedList = !(step.inputs.list_type == 'list');
	// If there is an assert type include that in the description
	var description = "";
	if (isRelatedList) {
	    var relatedListLabel = new ATFRelatedListUtil().getRelatedListLabels(step.inputs.table, step.inputs.related_list);
		description = gs.getMessage("Apply the following filter to the '{0}' related list on the '{1}' form:\n{2}", [relatedListLabel, formTable, descriptionGenerator.getConditionDescription(step.inputs.related_list_table, step.inputs.filter_conditions)]);
	} else
		description = gs.getMessage("Apply the following filter to the '{0}' list:\n{1}", [relatedListTable, descriptionGenerator.getConditionDescription(step.inputs.related_list_table, step.inputs.filter_conditions)]);

	if (assertion)
		description += "\n" + assertion;

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
}
 generateDescription();
