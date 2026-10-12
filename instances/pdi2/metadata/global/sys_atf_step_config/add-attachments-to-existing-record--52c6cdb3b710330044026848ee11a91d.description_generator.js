function generateDescription() {
	var descriptionGenerator = new ATFStepDescriptionGenerator();

	// If this is GEM use the GEM value directly
	// Otherwise get the display value of the record itself
	var recordName = "";
	if (step.inputs.record_id.hasMapping())
		recordName = step.inputs.record_id.getDisplayValue();
	else {
		var gr = new GlideRecord(step.inputs.table);
		if (gr.get(step.inputs.record_id))
			recordName = gr.getDisplayValue();
	}

	var description = gs.getMessage("Adds the following attachments to record '{0}' on table '{1}':", [recordName, step.inputs.table]);

	// Get the attachments list
    description += descriptionGenerator.getAttachmentsForRecord(step.getUniqueValue());

	// Add warning message if there is one
	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
}
 generateDescription();
